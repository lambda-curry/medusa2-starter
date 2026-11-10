import type { CatalogOperation } from './catalog';

const MAX_RESPONSE_BYTES = 64 * 1024;

export interface AuditEntry {
  operation: string;
  outcome: 'executed' | 'dry_run' | 'rejected' | 'refused';
  status?: number;
  problems?: string[];
}

export interface ExecutionTarget {
  /** The access token record id, for per-token rate limits. */
  tokenId: string;
  /** Records a write or delete attempt with who made it and against which spec revision. */
  audit: (entry: AuditEntry) => Promise<void>;
  /** Origin of this Medusa server as seen from inside the process, for example http://127.0.0.1:9000. */
  baseUrl: string;
  /** A short-lived Medusa admin JWT for the signed-in admin. Never the MCP client's own token. */
  adminToken: () => Promise<string>;
  /** A publishable API key for /store requests, if the store has one. */
  publishableKey: () => Promise<string | undefined>;
}

export interface ExecutionArgs {
  path_params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
}

export interface ExecutionResult {
  status: number;
  body: unknown;
  truncated?: { bytes: number; note: string };
}

export class ExecutionError extends Error {}

/** Declared path and query parameter names for an operation, including path-level parameters. */
export function declaredParameters(
  operation: CatalogOperation,
  pathItemParameters: unknown[] = [],
): { path: Set<string>; query: Set<string> } {
  const all = [...pathItemParameters, ...((operation.raw.parameters as unknown[] | undefined) ?? [])] as {
    name?: string;
    in?: string;
  }[];
  const pathNames = new Set([...operation.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]));
  return {
    path: pathNames,
    query: new Set(all.filter((parameter) => parameter.in === 'query' && parameter.name).map((p) => p.name as string)),
  };
}

/** Serializes query values the way Medusa's qs-based parser reads them: arrays as `key[]`, objects as `key[op]`. */
export function appendQuery(params: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    for (const item of value) appendQuery(params, `${key}[]`, item);
    return;
  }
  if (typeof value === 'object') {
    for (const [child, childValue] of Object.entries(value)) appendQuery(params, `${key}[${child}]`, childValue);
    return;
  }
  params.append(key, String(value));
}

/** Builds the request URL, refusing undeclared or missing parameters rather than guessing. */
export function buildRequestUrl(
  baseUrl: string,
  operation: CatalogOperation,
  declared: { path: Set<string>; query: Set<string> },
  args: ExecutionArgs,
): string {
  const pathParams = args.path_params ?? {};
  const unknownPath = Object.keys(pathParams).filter((name) => !declared.path.has(name));
  if (unknownPath.length) throw new ExecutionError(`Unknown path parameter(s): ${unknownPath.join(', ')}`);

  const path = operation.path.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = pathParams[name];
    if (value === undefined || value === null || value === '') {
      throw new ExecutionError(`Missing path parameter "${name}" for ${operation.operation}`);
    }
    return encodeURIComponent(String(value));
  });

  const query = args.query ?? {};
  const unknownQuery = Object.keys(query).filter((name) => !declared.query.has(name));
  if (unknownQuery.length) {
    throw new ExecutionError(
      `Unknown query parameter(s) for ${operation.operation}: ${unknownQuery.join(', ')}. Use describe_api to see the declared ones.`,
    );
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) appendQuery(params, key, value);

  const url = new URL(path, baseUrl);
  url.search = params.toString();
  return url.toString();
}

/** Calls the operation on this Medusa server as the signed-in admin and returns a size-bounded result. */
export async function executeOperation(
  target: ExecutionTarget,
  operation: CatalogOperation,
  declared: { path: Set<string>; query: Set<string> },
  args: ExecutionArgs,
): Promise<ExecutionResult> {
  const url = buildRequestUrl(target.baseUrl, operation, declared, args);
  const headers: Record<string, string> = { accept: 'application/json' };
  if (operation.area === 'admin') headers.authorization = `Bearer ${await target.adminToken()}`;
  if (operation.area === 'store') {
    const key = await target.publishableKey();
    if (key) headers['x-publishable-api-key'] = key;
  }
  const hasBody = args.body !== undefined && operation.method !== 'GET' && operation.method !== 'DELETE';
  if (hasBody) headers['content-type'] = 'application/json';

  const response = await fetch(url, {
    method: operation.method,
    headers,
    body: hasBody ? JSON.stringify(args.body) : undefined,
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  if (Buffer.byteLength(text) > MAX_RESPONSE_BYTES) {
    return {
      status: response.status,
      body: `${text.slice(0, MAX_RESPONSE_BYTES)}…`,
      truncated: {
        bytes: Buffer.byteLength(text),
        note: 'The response was cut off. Request fewer records with `limit`, or fewer fields with `fields`.',
      },
    };
  }
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Not JSON; return the text as-is.
  }
  return { status: response.status, body };
}

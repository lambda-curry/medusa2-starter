import type { ApiSpec } from '../openapi/build-spec';
import { API_AREAS, type ApiArea, HTTP_METHODS, type HttpMethod, type OpenApiDocument } from '../openapi/types';
import type { OperationPolicy } from './policy';

export type ExecutionTool = 'read_api' | 'write_api' | 'delete_api';

/** One callable operation from the published spec. */
export interface CatalogOperation {
  /** Canonical, unique key: `METHOD /path`. Medusa reuses operationIds across the admin and store documents. */
  operation: string;
  operation_id: string;
  area: ApiArea;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  /** The MCP tool that executes it, or undefined for methods no tool runs (OPTIONS, HEAD). */
  tool?: ExecutionTool;
  /** Set when the policy forbids this operation; the agent can still find and read about it. */
  blocked_by?: string;
  source: 'core' | 'custom';
  raw: Record<string, unknown>;
}

export interface Catalog {
  spec: ApiSpec;
  operations: CatalogOperation[];
  byKey: Map<string, CatalogOperation>;
}

const OPERATION_KEYS = new Set(HTTP_METHODS.map((method) => method.toLowerCase()));

export function toolFor(method: HttpMethod): ExecutionTool | undefined {
  if (method === 'GET') return 'read_api';
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') return 'write_api';
  if (method === 'DELETE') return 'delete_api';
  return undefined;
}

function operationsOf(area: ApiArea, document: OpenApiDocument, policy: OperationPolicy): CatalogOperation[] {
  return Object.entries(document.paths).flatMap(([path, item]) =>
    Object.entries(item)
      .filter(([key]) => OPERATION_KEYS.has(key))
      .map(([key, value]): CatalogOperation => {
        const raw = value as Record<string, unknown>;
        const method = key.toUpperCase() as HttpMethod;
        return {
          operation: `${method} ${path}`,
          operation_id: String(raw.operationId),
          area,
          method,
          path,
          summary: String(raw.summary ?? ''),
          description: String(raw.description ?? ''),
          tags: (raw.tags as string[] | undefined) ?? [],
          tool: toolFor(method),
          blocked_by: policy.blockedBy(method, path),
          source: raw['x-medusa-mcp-source'] === 'custom' ? 'custom' : 'core',
          raw,
        };
      }),
  );
}

/** Builds the operation catalog. Routes both documents define, such as /auth, are listed once. */
export function buildCatalog(spec: ApiSpec, policy: OperationPolicy): Catalog {
  const byKey = new Map<string, CatalogOperation>();
  for (const operation of API_AREAS.flatMap((area) => operationsOf(area, spec.documents[area], policy))) {
    if (!byKey.has(operation.operation)) byKey.set(operation.operation, operation);
  }
  return { spec, operations: [...byKey.values()], byKey };
}

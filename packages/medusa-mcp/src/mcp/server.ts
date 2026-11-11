import { fromJsonSchema, McpServer, requireScopes } from '@modelcontextprotocol/server';
import type { CatalogOperation, ExecutionTool } from './catalog';
import { describeOperation } from './describe';
import {
  declaredParameters,
  type ExecutionArgs,
  ExecutionError,
  type ExecutionResult,
  type ExecutionTarget,
  executeOperation,
} from './execute';
import { takeRateLimit } from './rate-limit';
import type { ApiRegistry } from './registry';
import { validateBody } from './validate';

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const WRITE = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const DELETE = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false };

type ToolResult = {
  content: { type: 'text'; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

function ok(data: Record<string, unknown>): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data };
}

function fail(message: string, data?: Record<string, unknown>): ToolResult {
  return { content: [{ type: 'text', text: message }], ...(data ? { structuredContent: data } : {}), isError: true };
}

/** Whether a write's body was checked against the published schema: it passed, there was no body, or the operation
 * publishes no JSON body schema. A failed check never reaches a dry run. */
type SchemaCheck = 'passed' | 'no_body' | 'no_schema';

const SCHEMA_CHECKED: Record<SchemaCheck, string> = {
  passed: 'The body matches the published schema',
  no_body: 'No body was given, so nothing was checked against the schema',
  no_schema: 'This operation publishes no body schema, so the body was not checked',
};

/** What a dry run proves and what it cannot, sent with every preview so an agent never reads one as acceptance. */
function dryRunLimits(check: SchemaCheck): string {
  return (
    `Nothing was sent to Medusa. ${SCHEMA_CHECKED[check]}, but Medusa checks its business rules only when the call ` +
    'runs, so the real call can still be rejected.'
  );
}

/** Advice for an agent on a failed call, by status. Medusa's own message says what to change. */
function errorHint(status: number): string {
  if (status === 400) {
    return 'Medusa rejected the request. Its business rules can require more than the published schema does, so correct the body using the message, then call again.';
  }
  if (status === 401 || status === 403) return 'The signed-in admin is not allowed to do this.';
  if (status === 404) return 'Medusa found no such resource. Check the path parameters.';
  if (status === 409) return 'The request conflicts with current data, for example a duplicate handle.';
  if (status >= 500) {
    return 'Medusa failed while handling the request. A write may have partly applied, so read the resource before retrying.';
  }
  return 'Medusa did not accept the request.';
}

/** Medusa's error fields (`type`, `code`, `message`), when the body has them. */
function medusaError(body: unknown): Record<string, string> {
  if (!body || typeof body !== 'object') return {};
  const fields: Record<string, string> = {};
  for (const key of ['type', 'code', 'message'] as const) {
    const value = (body as Record<string, unknown>)[key];
    if (typeof value === 'string') fields[key] = value;
  }
  return fields;
}

function oauth(scope: 'mcp:read' | 'mcp:write' | 'mcp:delete') {
  return { scopeChallenge: requireScopes(scope), _meta: { securitySchemes: [{ type: 'oauth2', scopes: [scope] }] } };
}

const operationInput = {
  operation: {
    type: 'string',
    description: 'The operation key from search_api, for example "GET /admin/products/{id}".',
  },
} as const;

const pathParamsInput = {
  type: 'object',
  description: 'Values for the {placeholders} in the operation path, for example { "id": "prod_123" }.',
  additionalProperties: { type: ['string', 'number'] },
} as const;

const queryInput = { type: 'object', description: 'Declared query parameters, for example { "limit": 5 }.' } as const;

type ToolArgs = ExecutionArgs & { operation: string; dry_run?: boolean };

/** One MCP server per request, scoped to the signed-in admin's registry and execution target. */
export function buildMcpServer(registry: ApiRegistry, target: ExecutionTarget): McpServer {
  const { catalog, search } = registry;
  const server = new McpServer(
    { name: 'medusa-mcp', version: '0.1.0' },
    {
      instructions:
        'Medusa commerce API. Find an operation with search_api, read its parameters and body with describe_api, then call it with read_api (GET), write_api (POST/PUT/PATCH), or delete_api (DELETE). Every call runs as the signed-in Medusa admin. Use write_api with dry_run first to show the user what will change.',
    },
  );

  const lookup = (key: unknown): CatalogOperation | ToolResult => {
    const operation = typeof key === 'string' ? catalog.byKey.get(key.trim()) : undefined;
    return (
      operation ?? fail(`Unknown operation "${String(key)}". Use search_api to find the exact "METHOD /path" key.`)
    );
  };

  const limited = (kind: 'call' | 'change') => {
    const message = takeRateLimit(target.tokenId, kind);
    return message ? fail(message) : undefined;
  };

  const declaredFor = (operation: CatalogOperation) => {
    const pathItem = catalog.spec.documents[operation.area].paths[operation.path] as { parameters?: unknown[] };
    return declaredParameters(operation, pathItem.parameters);
  };

  const run = async (operation: CatalogOperation, args: ExecutionArgs): Promise<ExecutionResult | ToolResult> => {
    try {
      return await executeOperation(target, operation, declaredFor(operation), args);
    } catch (error) {
      if (error instanceof ExecutionError) return fail(error.message);
      throw error;
    }
  };

  /** Shared checks for read_api, write_api, and delete_api: limits, the right tool, and the policy. */
  const resolveFor = (tool: ExecutionTool, args: ToolArgs): CatalogOperation | ToolResult => {
    const overLimit = limited('call') ?? (tool === 'read_api' ? undefined : limited('change'));
    if (overLimit) return overLimit;
    const operation = lookup(args.operation);
    if ('content' in operation) return operation;
    if (operation.blocked_by) {
      return fail(`${operation.operation} is blocked for agents by the "${operation.blocked_by}" rule.`);
    }
    if (operation.tool !== tool) {
      return fail(`${operation.operation} is not handled by ${tool}. Use ${operation.tool ?? 'another tool'} instead.`);
    }
    return operation;
  };

  const specRevision = catalog.spec.revision.slice(0, 12);

  const resultOf = (operation: CatalogOperation, result: ExecutionResult | ToolResult): ToolResult => {
    if ('content' in result) return result;
    if (result.status < 400) return ok({ operation: operation.operation, ...result });
    const error = {
      phase: 'medusa',
      status: result.status,
      ...medusaError(result.body),
      hint: errorHint(result.status),
    };
    return { ...ok({ operation: operation.operation, ...result, error, spec_revision: specRevision }), isError: true };
  };

  server.registerTool(
    'search_api',
    {
      title: 'Search the Medusa API',
      description:
        "Search this store's Admin and Store API operations by what you want to do. Returns the best matches with the operation key to pass to describe_api and the execution tools.",
      inputSchema: fromJsonSchema({
        type: 'object',
        properties: {
          query: { type: 'string', description: 'What you want to do, for example "update a product description".' },
          area: { type: 'string', enum: ['admin', 'store'], description: 'Limit results to the Admin or Store API.' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
          tag: { type: 'string', description: 'Limit results to one OpenAPI tag, for example "Products".' },
          limit: { type: 'integer', minimum: 1, maximum: 10, default: 5 },
        },
        required: ['query'],
        additionalProperties: false,
      }),
      annotations: READ_ONLY,
      ...oauth('mcp:read'),
    },
    async (input) => {
      const overLimit = limited('call');
      if (overLimit) return overLimit;
      const args = input as { query: string; area?: 'admin' | 'store'; method?: string; tag?: string; limit?: number };
      const results = search.search(args.query, args, args.limit ?? 5).map(({ operation, score }) => ({
        operation: operation.operation,
        operation_id: operation.operation_id,
        summary: operation.summary,
        area: operation.area,
        tool: operation.tool,
        ...(operation.blocked_by ? { blocked: true } : {}),
        score: Math.round(score * 100) / 100,
      }));
      return ok({
        results,
        index: {
          revision: catalog.spec.revision.slice(0, 12),
          medusa_version: catalog.spec.medusaVersion,
          operations: catalog.operations.length,
          undocumented_operations: catalog.spec.gaps.length,
        },
      });
    },
  );

  server.registerTool(
    'describe_api',
    {
      title: 'Describe a Medusa API operation',
      description:
        'Show one operation in full: path and query parameters, request body schema, and response shape. Call this before executing an operation.',
      inputSchema: fromJsonSchema({
        type: 'object',
        properties: operationInput,
        required: ['operation'],
        additionalProperties: false,
      }),
      annotations: READ_ONLY,
      ...oauth('mcp:read'),
    },
    async (input) => {
      const overLimit = limited('call');
      if (overLimit) return overLimit;
      const operation = lookup((input as { operation: string }).operation);
      if ('content' in operation) return operation;
      return ok(describeOperation(catalog.spec.documents[operation.area], operation));
    },
  );

  server.registerTool(
    'read_api',
    {
      title: 'Read from the Medusa API',
      description:
        'Call a GET operation as the signed-in admin. Pass path_params for {placeholders} and query for declared query parameters. Use `fields` and `limit` to keep responses small.',
      inputSchema: fromJsonSchema({
        type: 'object',
        properties: { ...operationInput, path_params: pathParamsInput, query: queryInput },
        required: ['operation'],
        additionalProperties: false,
      }),
      annotations: READ_ONLY,
      ...oauth('mcp:read'),
    },
    async (input) => {
      const args = input as ToolArgs;
      const operation = resolveFor('read_api', args);
      if ('content' in operation) return operation;
      return resultOf(operation, await run(operation, args));
    },
  );

  server.registerTool(
    'write_api',
    {
      title: 'Write to the Medusa API',
      description:
        "Call a POST, PUT, or PATCH operation as the signed-in admin with a JSON body matching describe_api. Set dry_run to true to check the body against the schema and see current and proposed values without changing anything. A dry run does not run Medusa's business rules, so the real call can still be rejected; a rejection comes back with Medusa's message to correct the body.",
      inputSchema: fromJsonSchema({
        type: 'object',
        properties: {
          ...operationInput,
          path_params: pathParamsInput,
          query: queryInput,
          body: { type: 'object', description: 'The JSON request body.' },
          dry_run: {
            type: 'boolean',
            description: 'Check the body against the schema and preview the change without sending it to Medusa.',
            default: false,
          },
        },
        required: ['operation'],
        additionalProperties: false,
      }),
      annotations: WRITE,
      ...oauth('mcp:write'),
    },
    async (input) => {
      const args = input as ToolArgs;
      const operation = resolveFor('write_api', args);
      if ('content' in operation) return refused(args, operation);

      const requestBody = operation.raw.requestBody as { content?: Record<string, { schema?: object }> } | undefined;
      const contentTypes = Object.keys(requestBody?.content ?? {});
      if (contentTypes.length && !contentTypes.some((type) => type.includes('json'))) {
        return refused(
          args,
          fail(`${operation.operation} takes ${contentTypes.join(' or ')}, which write_api cannot send.`),
        );
      }
      const schema = requestBody?.content?.['application/json']?.schema;
      const schemaCheck: SchemaCheck = !schema ? 'no_schema' : args.body === undefined ? 'no_body' : 'passed';
      if (schema && args.body !== undefined) {
        const problems = validateBody(catalog.spec, operation.area, schema, args.body);
        if (problems.length) {
          await target.audit({ ...auditBase(args), outcome: 'rejected', problems });
          return fail(`The body does not match ${operation.operation}:\n- ${problems.join('\n- ')}`, {
            operation: operation.operation,
            error: {
              phase: 'schema',
              problems,
              hint: 'Nothing was sent to Medusa. Fix the body to match describe_api, then call again.',
            },
            spec_revision: specRevision,
          });
        }
      }

      return audited(args, async () => {
        if (args.dry_run) {
          const preview = await dryRun(operation, args, schemaCheck);
          await target.audit({ ...auditBase(args), outcome: 'dry_run' });
          return preview;
        }
        return executeAudited(operation, args);
      });
    },
  );

  server.registerTool(
    'delete_api',
    {
      title: 'Delete through the Medusa API',
      description:
        'Call a DELETE operation as the signed-in admin. This removes data; confirm with the user before calling it.',
      inputSchema: fromJsonSchema({
        type: 'object',
        properties: { ...operationInput, path_params: pathParamsInput, query: queryInput },
        required: ['operation'],
        additionalProperties: false,
      }),
      annotations: DELETE,
      ...oauth('mcp:delete'),
    },
    async (input) => {
      const args = input as ToolArgs;
      const operation = resolveFor('delete_api', args);
      if ('content' in operation) return refused(args, operation);
      return audited(args, () => executeAudited(operation, args));
    },
  );

  function auditBase(args: ToolArgs) {
    return { operation: String(args.operation), ...(args.path_params ? { path_params: args.path_params } : {}) };
  }

  /** Logs a refused write or delete attempt, with the reason the agent was given, and returns the refusal. */
  async function refused(args: ToolArgs, result: ToolResult): Promise<ToolResult> {
    await target.audit({ ...auditBase(args), outcome: 'refused', reason: result.content[0]?.text });
    return result;
  }

  /** Logs an attempt that threw before it finished. The request may have reached Medusa, so it must be recorded. */
  async function audited(args: ToolArgs, attempt: () => Promise<ToolResult>): Promise<ToolResult> {
    try {
      return await attempt();
    } catch (error) {
      await target.audit({ ...auditBase(args), outcome: 'failed', reason: (error as Error).message });
      throw error;
    }
  }

  async function executeAudited(operation: CatalogOperation, args: ToolArgs): Promise<ToolResult> {
    const result = await run(operation, args);
    if ('content' in result) return refused(args, result);
    await target.audit({ ...auditBase(args), outcome: 'executed', status: result.status });
    return resultOf(operation, result);
  }

  /**
   * Previews a write without sending it. For an operation on one resource (its path ends in a path parameter), shows
   * the current value of each top-level body field next to the proposed one, by reading the same path with GET. A
   * create or action has no current values, so only the proposal is shown. Without mcp:read the current values stay
   * hidden, since a dry run must not become a way to read data the token cannot read.
   */
  async function dryRun(operation: CatalogOperation, args: ToolArgs, schemaCheck: SchemaCheck): Promise<ToolResult> {
    const fields = Object.keys((args.body as Record<string, unknown> | undefined) ?? {});
    const preview = {
      operation: operation.operation,
      dry_run: true,
      executed: false,
      schema_check: schemaCheck,
      limits: dryRunLimits(schemaCheck),
    };
    const proposalOnly = (note: string) => ok({ ...preview, proposed: args.body ?? null, current: null, note });

    const read = catalog.byKey.get(`GET ${operation.path}`);
    if (!/\{[^}]+\}$/.test(operation.path) || !read || read.blocked_by) {
      return proposalOnly('This operation creates or acts on a resource, so there are no current values to compare.');
    }
    if (!target.scopes.includes('mcp:read')) return proposalOnly('Current values need the mcp:read scope.');

    const query = declaredFor(read).query.has('fields') && fields.length ? { fields: fields.join(',') } : undefined;
    const current = await run(read, { path_params: args.path_params, query });
    if ('content' in current) return current;
    if (current.status >= 400) return resultOf(read, current);

    const resource = Object.values((current.body as Record<string, unknown>) ?? {}).find(
      (value) => value && typeof value === 'object' && !Array.isArray(value),
    ) as Record<string, unknown> | undefined;
    const changes = fields.map((field) => ({
      field,
      current: resource?.[field] ?? null,
      proposed: (args.body as Record<string, unknown>)[field],
    }));
    return ok({ ...preview, changes });
  }

  return server;
}

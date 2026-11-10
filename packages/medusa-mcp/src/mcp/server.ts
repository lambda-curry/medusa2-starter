import { fromJsonSchema, McpServer, requireScopes } from '@modelcontextprotocol/server';
import type { CatalogOperation } from './catalog';
import { describeOperation } from './describe';
import { declaredParameters, ExecutionError, type ExecutionTarget, executeOperation } from './execute';
import type { ApiRegistry } from './registry';

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

type ToolResult = {
  content: { type: 'text'; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

function ok(data: Record<string, unknown>): ToolResult {
  return { content: [{ type: 'text', text: JSON.stringify(data) }], structuredContent: data };
}

function fail(message: string): ToolResult {
  return { content: [{ type: 'text', text: message }], isError: true };
}

const operationInput = {
  operation: {
    type: 'string',
    description: 'The operation key from search_api, for example "GET /admin/products/{id}".',
  },
} as const;

/** One MCP server per request, scoped to the signed-in admin's registry and execution target. */
export function buildMcpServer(registry: ApiRegistry, target: ExecutionTarget): McpServer {
  const { catalog, search } = registry;
  const server = new McpServer(
    { name: 'medusa-mcp', version: '0.1.0' },
    {
      instructions:
        'Medusa commerce API. Find an operation with search_api, read its parameters and body with describe_api, then call it with read_api (GET). Every call runs as the signed-in Medusa admin.',
    },
  );

  const lookup = (key: unknown): CatalogOperation | ToolResult => {
    const operation = typeof key === 'string' ? catalog.byKey.get(key.trim()) : undefined;
    return (
      operation ?? fail(`Unknown operation "${String(key)}". Use search_api to find the exact "METHOD /path" key.`)
    );
  };

  server.registerTool(
    'search_api',
    {
      title: 'Search the Medusa API',
      description:
        "Search this store's Admin and Store API operations by what you want to do. Returns the best matches with the operation key to pass to describe_api and read_api.",
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
      scopeChallenge: requireScopes('mcp:read'),
      _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['mcp:read'] }] },
    },
    async (input) => {
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
        'Show one operation in full: path and query parameters, request body schema, and response shape. Call this before read_api.',
      inputSchema: fromJsonSchema({
        type: 'object',
        properties: operationInput,
        required: ['operation'],
        additionalProperties: false,
      }),
      annotations: READ_ONLY,
      scopeChallenge: requireScopes('mcp:read'),
      _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['mcp:read'] }] },
    },
    async (input) => {
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
        properties: {
          ...operationInput,
          path_params: { type: 'object', additionalProperties: { type: ['string', 'number'] } },
          query: { type: 'object', description: 'Declared query parameters, for example { "limit": 5 }.' },
        },
        required: ['operation'],
        additionalProperties: false,
      }),
      annotations: READ_ONLY,
      scopeChallenge: requireScopes('mcp:read'),
      _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['mcp:read'] }] },
    },
    async (input) => {
      const args = input as {
        operation: string;
        path_params?: Record<string, unknown>;
        query?: Record<string, unknown>;
      };
      const operation = lookup(args.operation);
      if ('content' in operation) return operation;
      if (operation.blocked_by) {
        return fail(`${operation.operation} is blocked for agents by the "${operation.blocked_by}" rule.`);
      }
      if (operation.tool !== 'read_api') {
        return fail(`${operation.operation} is not a read. Use ${operation.tool ?? 'another tool'} instead.`);
      }

      const pathItem = catalog.spec.documents[operation.area].paths[operation.path] as { parameters?: unknown[] };
      try {
        const result = await executeOperation(
          target,
          operation,
          declaredParameters(operation, pathItem.parameters),
          args,
        );
        return { ...ok({ operation: operation.operation, ...result }), isError: result.status >= 400 };
      } catch (error) {
        if (error instanceof ExecutionError) return fail(error.message);
        throw error;
      }
    },
  );

  return server;
}

import path from 'node:path';
import type { DiscoveredRoute } from './discover-routes';
import type { ApiArea, HttpMethod, OpenApiOperation, SpecGap } from './types';

export type JsonSchema = Record<string, unknown>;

export type ToJsonSchema = (schema: unknown, io: 'input' | 'output') => JsonSchema;

/** Matches the security Medusa's own admin operations declare. */
const ADMIN_SECURITY = [{ api_token: [] }, { cookie_auth: [] }, { jwt_token: [] }];

type ZodWithJsonSchema = {
  toJSONSchema: (schema: unknown, params: Record<string, unknown>) => JsonSchema;
};

/**
 * Converts contract schemas with the Zod the indexed project itself resolves through
 * `@medusajs/framework/zod`. The plugin may load a different Zod copy, and a schema has to be converted by the
 * Zod that created it.
 */
export function projectZodJsonSchema(projectRoot: string): ToJsonSchema {
  const zodModule = require(require.resolve('@medusajs/framework/zod', { paths: [projectRoot] })) as {
    z?: ZodWithJsonSchema;
  } & ZodWithJsonSchema;
  const z = zodModule.z ?? zodModule;

  return (schema, io) => z.toJSONSchema(schema, { target: 'openapi-3.0', io, unrepresentable: 'throw' });
}

export function areaOf(openApiPath: string): ApiArea | undefined {
  if (openApiPath === '/admin' || openApiPath.startsWith('/admin/')) return 'admin';
  if (openApiPath === '/store' || openApiPath.startsWith('/store/')) return 'store';
  return undefined;
}

export type CustomPaths = {
  paths: Record<ApiArea, Record<string, Record<string, unknown>>>;
  gaps: SpecGap[];
  problems: string[];
};

function buildOperation(
  route: DiscoveredRoute,
  tag: string,
  area: ApiArea,
  operation: OpenApiOperation,
  toJsonSchema: ToJsonSchema,
): Record<string, unknown> {
  const parameters: Record<string, unknown>[] = [...route.path.matchAll(/\{([^}]+)\}/g)].map((match) => ({
    name: match[1],
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }));

  if (operation.query) {
    const query = toJsonSchema(operation.query, 'input');
    const properties = query.properties as Record<string, JsonSchema> | undefined;
    if (query.type !== 'object' || !properties) {
      throw new Error('query must be a Zod object schema');
    }
    const required = new Set((query.required as string[] | undefined) ?? []);
    for (const [name, schema] of Object.entries(properties)) {
      parameters.push({ name, in: 'query', required: required.has(name), schema });
    }
  }

  return {
    operationId: operation.operationId,
    summary: operation.summary,
    ...(operation.description ? { description: operation.description } : {}),
    tags: [tag],
    ...(parameters.length ? { parameters } : {}),
    ...(operation.body
      ? {
          requestBody: {
            required: operation.bodyRequired ?? true,
            content: {
              [operation.bodyContentType ?? 'application/json']: { schema: toJsonSchema(operation.body, 'input') },
            },
          },
        }
      : {}),
    responses: Object.fromEntries(
      Object.entries(operation.responses).map(([status, response]) => [
        status,
        {
          description: response.description,
          ...(response.schema
            ? {
                content: {
                  [response.contentType ?? 'application/json']: { schema: toJsonSchema(response.schema, 'output') },
                },
              }
            : {}),
        },
      ]),
    ),
    ...(area === 'admin' ? { security: ADMIN_SECURITY } : {}),
    'x-medusa-mcp-source': 'custom',
  };
}

/** Turns documented project routes into OpenAPI path items, split by area. */
export function buildCustomPaths(
  routes: DiscoveredRoute[],
  toJsonSchema: ToJsonSchema,
  apiDirectory: string,
): CustomPaths {
  const result: CustomPaths = { paths: { admin: {}, store: {} }, gaps: [], problems: [] };
  const operationIds = new Map<string, string>();

  for (const route of routes) {
    const { contract } = route;
    if (!contract) continue;

    const area = areaOf(route.path);
    for (const method of route.methods) {
      const location = `${method} ${route.path}`;
      if (contract.hidden || !area) {
        result.gaps.push({
          method,
          path: route.path,
          source: 'app',
          reason: contract.hidden ? 'hidden' : 'outside-admin-and-store',
        });
        continue;
      }

      const operation = contract.operations[method as HttpMethod];
      if (!operation) continue;

      const previous = operationIds.get(operation.operationId);
      if (previous) {
        result.problems.push(`operationId "${operation.operationId}" is used by both ${previous} and ${location}`);
        continue;
      }
      operationIds.set(operation.operationId, location);

      try {
        result.paths[area][route.path] ??= {};
        result.paths[area][route.path][method.toLowerCase()] = buildOperation(
          route,
          contract.tag,
          area,
          operation,
          toJsonSchema,
        );
      } catch (error) {
        const contractFile = route.contractFile ? path.relative(apiDirectory, route.contractFile) : route.routeFile;
        result.problems.push(`${location} in ${contractFile}: ${(error as Error).message}`);
      }
    }
  }

  return result;
}

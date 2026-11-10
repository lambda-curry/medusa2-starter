/** Every HTTP method a Medusa route file can export. */
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'] as const;

export type HttpMethod = (typeof HTTP_METHODS)[number];

export const API_AREAS = ['admin', 'store'] as const;

export type ApiArea = (typeof API_AREAS)[number];

export type OpenApiResponse = {
  description: string;
  /** A Zod schema from `@medusajs/framework/zod`. */
  schema?: unknown;
  contentType?: 'application/json' | 'text/csv' | 'text/html';
};

export type OpenApiOperation = {
  operationId: string;
  summary: string;
  description?: string;
  /** A Zod schema for the request body. */
  body?: unknown;
  bodyRequired?: boolean;
  bodyContentType?: 'application/json' | 'multipart/form-data';
  /** A Zod object schema for the query string. */
  query?: unknown;
  responses: Record<number, OpenApiResponse>;
};

/**
 * The contract a route publishes in an `openapi.ts` file next to its `route.ts`. It must document every HTTP
 * method the route exports, and nothing else.
 */
export type OpenApiRouteContract = {
  /** Keep the route out of the published spec, for internal or unsafe routes. */
  hidden?: boolean;
  tag: string;
  operations: Partial<Record<HttpMethod, OpenApiOperation>>;
};

export type OpenApiDocument = {
  openapi: string;
  info: { title: string; version: string; [key: string]: unknown };
  paths: Record<string, Record<string, unknown>>;
  tags?: { name: string; [key: string]: unknown }[];
  components?: Record<string, Record<string, unknown>>;
  [key: string]: unknown;
};

/** An operation Medusa serves that the published spec does not describe. */
export type SpecGap = {
  method: HttpMethod;
  path: string;
  /** `app` for the project's own routes, otherwise the plugin package name. */
  source: string;
  reason: 'undocumented-plugin-route' | 'outside-admin-and-store' | 'hidden';
};

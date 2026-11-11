import type { OpenApiDocument } from '../openapi/types';
import type { CatalogOperation } from './catalog';

const DROPPED_KEYS = new Set(['example', 'examples', 'externalDocs', 'xml']);
const MAX_DESCRIPTION = 400;

export interface DescribeLimits {
  /** How many nested `$ref`s to inline before stopping. */
  maxRefDepth: number;
  /** How many levels of properties, items, and oneOf/anyOf/allOf to expand before summarizing. */
  maxNesting: number;
}

const NESTING_KEYS = new Set(['properties', 'items', 'oneOf', 'anyOf', 'allOf', 'additionalProperties', 'not']);

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function refTarget(document: OpenApiDocument, ref: string): Json | undefined {
  if (!ref.startsWith('#/')) return undefined;
  return ref
    .slice(2)
    .split('/')
    .reduce<Json | undefined>(
      (node, key) => (node && typeof node === 'object' && !Array.isArray(node) ? node[key] : undefined),
      document as unknown as Json,
    );
}

/**
 * Copies a schema with `$ref`s inlined, stopping at cycles and at `maxRefDepth` (where the ref is kept as a name),
 * and dropping examples and `x-` extensions so the result stays small enough for a model to read.
 */
export function inlineSchema(
  document: OpenApiDocument,
  node: Json,
  limits: DescribeLimits,
  seen: string[] = [],
  nesting = 0,
): Json {
  if (Array.isArray(node)) return node.map((item) => inlineSchema(document, item, limits, seen, nesting));
  if (!node || typeof node !== 'object') return node;
  if (nesting > limits.maxNesting) {
    const types = [
      node.type,
      ...(['oneOf', 'anyOf'] as const).flatMap((key) =>
        Array.isArray(node[key]) ? (node[key] as Json[]).map((variant) => (variant as Record<string, Json>)?.type) : [],
      ),
    ].filter(Boolean);
    return { ...(types.length ? { type: [...new Set(types)] as Json } : {}), note: 'nested schema not expanded' };
  }

  if (typeof node.$ref === 'string') {
    const name = node.$ref.split('/').pop() ?? node.$ref;
    if (seen.includes(node.$ref)) return { $ref: name, note: 'circular reference' };
    if (seen.length >= limits.maxRefDepth)
      return { $ref: name, note: 'not expanded; describe a narrower field if needed' };
    const target = refTarget(document, node.$ref);
    return target === undefined
      ? { $ref: name }
      : inlineSchema(document, target, limits, [...seen, node.$ref], nesting);
  }

  const copy: Record<string, Json> = {};
  for (const [key, value] of Object.entries(node)) {
    if (DROPPED_KEYS.has(key) || key.startsWith('x-')) continue;
    copy[key] =
      key === 'description' && typeof value === 'string' && value.length > MAX_DESCRIPTION
        ? `${value.slice(0, MAX_DESCRIPTION)}…`
        : inlineSchema(document, value, limits, seen, NESTING_KEYS.has(key) ? nesting + 1 : nesting);
  }
  return copy;
}

interface Parameter {
  name: string;
  in: string;
  required?: boolean;
  description?: string;
  schema?: Json;
}

function parameters(document: OpenApiDocument, operation: CatalogOperation, limits: DescribeLimits) {
  const pathItem = document.paths[operation.path] as { parameters?: Json[] };
  const raw = [...(pathItem.parameters ?? []), ...((operation.raw.parameters as Json[] | undefined) ?? [])];
  return raw
    .map((parameter) => inlineSchema(document, parameter, limits) as unknown as Parameter)
    .filter((parameter) => parameter.in === 'path' || parameter.in === 'query')
    .map((parameter) => ({
      name: parameter.name,
      in: parameter.in,
      required: parameter.in === 'path' ? true : Boolean(parameter.required),
      ...(parameter.description ? { description: parameter.description } : {}),
      ...(parameter.schema ? { schema: parameter.schema } : {}),
    }));
}

function jsonContentSchema(document: OpenApiDocument, content: unknown, limits: DescribeLimits) {
  const entries = Object.entries((content ?? {}) as Record<string, { schema?: Json }>);
  const [contentType, media] = entries.find(([type]) => type.includes('json')) ?? entries[0] ?? [];
  if (!contentType) return undefined;
  return {
    content_type: contentType,
    schema: media?.schema ? inlineSchema(document, media.schema, limits) : undefined,
  };
}

/** Everything an agent needs to call one operation, with schemas inlined and bounded. */
export function describeOperation(
  document: OpenApiDocument,
  operation: CatalogOperation,
  limits: { query: DescribeLimits; body: DescribeLimits; response: DescribeLimits } = {
    query: { maxRefDepth: 2, maxNesting: 1 },
    body: { maxRefDepth: 4, maxNesting: 6 },
    response: { maxRefDepth: 1, maxNesting: 3 },
  },
) {
  const params = parameters(document, operation, limits.query);
  const body = operation.raw.requestBody as { required?: boolean; content?: unknown } | undefined;
  const responses = Object.fromEntries(
    Object.entries(
      (operation.raw.responses ?? {}) as Record<string, { description?: string; content?: unknown; $ref?: string }>,
    )
      .filter(([status]) => status.startsWith('2'))
      .map(([status, response]) => {
        const resolved = (response.$ref ? refTarget(document, response.$ref) : response) as {
          description?: string;
          content?: unknown;
        };
        return [
          status,
          { description: resolved?.description, ...jsonContentSchema(document, resolved?.content, limits.response) },
        ];
      }),
  );

  return {
    operation: operation.operation,
    operation_id: operation.operation_id,
    area: operation.area,
    method: operation.method,
    path: operation.path,
    summary: operation.summary,
    description:
      operation.description.length > 1500 ? `${operation.description.slice(0, 1500)}…` : operation.description,
    tags: operation.tags,
    tool: operation.tool,
    ...(operation.blocked_by ? { blocked_by: operation.blocked_by } : {}),
    path_params: params.filter((parameter) => parameter.in === 'path'),
    query_params: params.filter((parameter) => parameter.in === 'query'),
    request_body: body
      ? { required: Boolean(body.required), ...jsonContentSchema(document, body.content, limits.body) }
      : null,
    responses,
  };
}

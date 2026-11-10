import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import type { ApiSpec } from '../openapi/build-spec';
import type { ApiArea } from '../openapi/types';

const instances = new Map<string, Ajv>();

function documentId(spec: ApiSpec, area: ApiArea): string {
  return `${spec.revision}:${area}`;
}

function ajvFor(spec: ApiSpec, area: ApiArea): Ajv {
  const id = documentId(spec, area);
  let ajv = instances.get(id);
  if (!ajv) {
    ajv = new Ajv({ strict: false, allErrors: true, allowUnionTypes: true });
    addFormats(ajv);
    ajv.addSchema({ components: spec.documents[area].components ?? {} }, id);
    instances.set(id, ajv);
  }
  return ajv;
}

/** Points the schema's local `#/components/...` refs at the registered document so they resolve. */
function anchorRefs(node: unknown, id: string): unknown {
  if (Array.isArray(node)) return node.map((item) => anchorRefs(item, id));
  if (!node || typeof node !== 'object') return node;
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [
      key,
      key === '$ref' && typeof value === 'string' && value.startsWith('#/') ? `${id}${value}` : anchorRefs(value, id),
    ]),
  );
}

/**
 * Medusa's published spec never marks fields nullable, but its validators accept null for many optional fields,
 * such as clearing a description. Null values are dropped before validation and left for Medusa to judge.
 */
export function withoutNulls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutNulls);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, child]) => child !== null)
      .map(([key, child]) => [key, withoutNulls(child)]),
  );
}

const compiled = new WeakMap<object, ValidateFunction>();

/** Validates a request body against the operation's JSON request schema; returns readable problems, or none. */
export function validateBody(spec: ApiSpec, area: ApiArea, schema: object, body: unknown): string[] {
  let validate = compiled.get(schema);
  if (!validate) {
    validate = ajvFor(spec, area).compile(anchorRefs(schema, documentId(spec, area)) as object);
    compiled.set(schema, validate);
  }
  if (validate(withoutNulls(body))) return [];
  return (validate.errors ?? []).slice(0, 8).map((error) => `${error.instancePath || 'body'} ${error.message}`);
}

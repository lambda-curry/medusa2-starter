import path from 'node:path';
import { buildApiSpec } from '../../openapi/build-spec';
import { buildCatalog } from '../catalog';
import { createPolicy } from '../policy';
import { RATE_LIMITS, takeRateLimit, trackedRateLimitKeys } from '../rate-limit';
import { validateBody, withoutNulls } from '../validate';

const spec = buildApiSpec({ projectRoot: path.join(__dirname, '../../openapi/__tests__/fixtures/valid') });
const catalog = buildCatalog(spec, createPolicy());
const jsonBodySchema = (key: string) => {
  const operation = catalog.byKey.get(key);
  const content = (operation?.raw.requestBody as { content?: Record<string, { schema?: object }> } | undefined)
    ?.content;
  return { operation, schema: content?.['application/json']?.schema };
};

describe('validateBody', () => {
  it('compiles the request schema of every JSON write operation in the spec', () => {
    const failures = catalog.operations
      .filter((operation) => operation.tool === 'write_api')
      .flatMap((operation) => {
        const { schema } = jsonBodySchema(operation.operation);
        if (!schema) return [];
        try {
          validateBody(spec, operation.area, schema, {});
          return [];
        } catch (error) {
          return [`${operation.operation}: ${(error as Error).message}`];
        }
      });
    expect(failures).toEqual([]);
  });

  const { schema } = jsonBodySchema('POST /admin/products/{id}');

  it('accepts a valid product update, including null to clear a field', () => {
    expect(validateBody(spec, 'admin', schema as object, { description: 'New copy' })).toEqual([]);
    expect(validateBody(spec, 'admin', schema as object, { description: null, title: 'Decaf' })).toEqual([]);
  });

  it('reports type and shape problems with their location', () => {
    expect(validateBody(spec, 'admin', schema as object, { description: 42 })).toContainEqual(
      '/description must be string',
    );
    expect(validateBody(spec, 'admin', schema as object, { status: 'not-a-status' }).join('\n')).toContain('/status');
  });

  it('validates custom contract bodies too', () => {
    const custom = jsonBodySchema('POST /admin/widgets').schema as object;
    expect(validateBody(spec, 'admin', custom, { name: 'Widget' })).toEqual([]);
    expect(validateBody(spec, 'admin', custom, {})).toEqual(["body must have required property 'name'"]);
  });

  it('drops nulls recursively before validation', () => {
    expect(withoutNulls({ a: null, b: { c: null, d: 1 }, e: [{ f: null }] })).toEqual({ b: { d: 1 }, e: [{}] });
  });
});

describe('takeRateLimit', () => {
  it('allows calls up to the limit within a minute, then refuses, then recovers', () => {
    const token = `token-${Math.random()}`;
    const start = 1_000_000;
    for (let index = 0; index < RATE_LIMITS.change; index++) {
      expect(takeRateLimit(token, 'change', start + index)).toBeUndefined();
    }
    expect(takeRateLimit(token, 'change', start + 100)).toMatch(/at most 30 writes and deletes per minute/);
    expect(takeRateLimit(token, 'change', start + 61_000)).toBeUndefined();
    expect(takeRateLimit(`other-${token}`, 'change', start + 100)).toBeUndefined();
  });

  it('forgets tokens that have gone a full window without a call', () => {
    const start = 10_000_000;
    for (let index = 0; index < 50; index++) takeRateLimit(`idle-${index}`, 'call', start);
    expect(trackedRateLimitKeys()).toBeGreaterThanOrEqual(50);
    takeRateLimit('active', 'call', start + 61_000);
    expect(trackedRateLimitKeys()).toBe(1);
  });
});

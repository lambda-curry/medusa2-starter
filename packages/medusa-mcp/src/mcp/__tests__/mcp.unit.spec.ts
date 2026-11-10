import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { buildApiSpec } from '../../openapi/build-spec';
import { buildCatalog } from '../catalog';
import { describeOperation } from '../describe';
import { appendQuery, buildRequestUrl, declaredParameters, ExecutionError, executeOperation } from '../execute';
import { BUILT_IN_BLOCKLIST, createPolicy } from '../policy';
import { buildSearchIndex, queryIntent, tokenize } from '../search';

const spec = buildApiSpec({ projectRoot: path.join(__dirname, '../../openapi/__tests__/fixtures/valid') });
const catalog = buildCatalog(spec, createPolicy());
const operation = (key: string) => {
  const found = catalog.byKey.get(key);
  if (!found) throw new Error(`${key} is not in the catalog`);
  return found;
};

describe('policy', () => {
  const policy = createPolicy(['DELETE /admin/products/{id}', '* /admin/gift-cards/**']);

  it.each([
    ['POST', '/auth/user/{auth_provider}', '* /auth/**'],
    ['GET', '/admin/api-keys', '* /admin/api-keys'],
    ['GET', '/admin/api-keys/{id}', '* /admin/api-keys/**'],
    ['POST', '/admin/invites/accept', '* /admin/invites/**'],
    ['POST', '/admin/users/{id}', 'POST /admin/users/{id}'],
    ['POST', '/admin/workflows-executions/{workflow_id}/run', '* /admin/workflows-executions/{workflow_id}/run'],
    ['DELETE', '/admin/products/{id}', 'DELETE /admin/products/{id}'],
    ['GET', '/admin/gift-cards/{id}', '* /admin/gift-cards/**'],
  ] as const)('blocks %s %s', (method, route, rule) => {
    expect(policy.blockedBy(method, route)).toBe(rule);
  });

  it.each([
    ['GET', '/admin/users/{id}'],
    ['GET', '/admin/products/{id}'],
    ['POST', '/admin/products/{id}'],
    ['GET', '/admin/workflows-executions'],
    ['GET', '/admin/api-keysmith'],
  ] as const)('allows %s %s', (method, route) => {
    expect(policy.blockedBy(method, route)).toBeUndefined();
  });

  it('rejects malformed entries', () => {
    expect(() => createPolicy(['/admin/products'])).toThrow(/Invalid medusa-mcp blocked operation/);
    expect(() => createPolicy(['FETCH /admin/products'])).toThrow(/Invalid medusa-mcp blocked operation/);
  });

  it('only lists valid built-in entries', () => {
    expect(() => createPolicy(BUILT_IN_BLOCKLIST)).not.toThrow();
  });
});

describe('catalog', () => {
  it('keys every operation by METHOD /path, once, even where Medusa reuses operationIds', () => {
    expect(catalog.byKey.size).toBe(catalog.operations.length);
    expect(operation('GET /admin/collections').operation_id).toBe('GetCollections');
    expect(operation('GET /store/collections').operation_id).toBe('GetCollections');
    expect(catalog.operations.filter((entry) => entry.operation === 'POST /auth/session')).toHaveLength(1);
  });

  it('maps methods to tools, marks blocked operations, and keeps custom routes', () => {
    expect(operation('GET /admin/products').tool).toBe('read_api');
    expect(operation('POST /admin/products/{id}').tool).toBe('write_api');
    expect(operation('DELETE /admin/products/{id}').tool).toBe('delete_api');
    expect(operation('GET /admin/api-keys').blocked_by).toBe('* /admin/api-keys');
    expect(operation('GET /admin/widgets')).toMatchObject({ source: 'custom', tool: 'read_api' });
  });
});

describe('describeOperation', () => {
  it('keeps every operation under 25 KB', () => {
    const largest = catalog.operations
      .map((entry) => ({
        key: entry.operation,
        bytes: JSON.stringify(describeOperation(spec.documents[entry.area], entry)).length,
      }))
      .sort((left, right) => right.bytes - left.bytes)[0];
    expect(largest.bytes).toBeLessThan(25 * 1024);
  });

  it('shows the product update body, including description, and the path parameter', () => {
    const description = describeOperation(spec.documents.admin, operation('POST /admin/products/{id}'));
    expect(description).toMatchObject({
      operation: 'POST /admin/products/{id}',
      tool: 'write_api',
      path_params: [{ name: 'id', in: 'path', required: true }],
    });
    expect(JSON.stringify(description.request_body)).toContain('"description"');
  });
});

describe('request URLs', () => {
  const products = operation('GET /admin/products/{id}');
  const declared = declaredParameters(products);

  it('encodes path parameters and serializes queries the way Medusa parses them', () => {
    expect(
      buildRequestUrl('http://127.0.0.1:9000', products, declared, {
        path_params: { id: 'prod/1 x' },
        query: { fields: 'id,title' },
      }),
    ).toBe('http://127.0.0.1:9000/admin/products/prod%2F1%20x?fields=id%2Ctitle');

    const params = new URLSearchParams();
    appendQuery(params, 'id', ['a', 'b']);
    appendQuery(params, 'created_at', { $gte: '2026-01-01' });
    expect(decodeURIComponent(params.toString())).toBe('id[]=a&id[]=b&created_at[$gte]=2026-01-01');
  });

  it('refuses dot-segment path parameters that would resolve to a different, unchecked path', () => {
    const nested = operation('GET /admin/workflows-executions/{workflow_id}/{transaction_id}');
    const nestedDeclared = declaredParameters(nested);
    expect(() =>
      buildRequestUrl('http://x', nested, nestedDeclared, {
        path_params: { workflow_id: '..', transaction_id: 'api-keys' },
      }),
    ).toThrow(/cannot be "\.\."/);
    expect(() => buildRequestUrl('http://x', products, declared, { path_params: { id: '.' } })).toThrow(ExecutionError);
    expect(() => buildRequestUrl('http://x', products, declared, { path_params: { id: '..' } })).toThrow(
      ExecutionError,
    );
    expect(buildRequestUrl('http://x', products, declared, { path_params: { id: '%2e%2e' } })).toBe(
      'http://x/admin/products/%252e%252e',
    );
  });

  it('refuses missing or unknown parameters instead of guessing', () => {
    expect(() => buildRequestUrl('http://x', products, declared, {})).toThrow(ExecutionError);
    expect(() => buildRequestUrl('http://x', products, declared, { path_params: { id: 'p', other: 'x' } })).toThrow(
      /Unknown path parameter/,
    );
    expect(() =>
      buildRequestUrl('http://x', products, declared, { path_params: { id: 'p' }, query: { nope: 1 } }),
    ).toThrow(/Unknown query parameter/);
  });
});

describe('executeOperation', () => {
  it('caps responses at 64 KB by bytes, without leaving a broken multi-byte character', async () => {
    const body = 'é'.repeat(75_000); // 150,000 bytes as UTF-8
    const server = createServer((_req, res) => res.writeHead(200, { 'content-type': 'text/plain' }).end(body));
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const target = {
        baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
        adminToken: async () => 'jwt',
        publishableKey: async () => undefined,
      };
      const products = operation('GET /admin/products');
      const result = await executeOperation(target as never, products, declaredParameters(products), {});
      expect(result.truncated?.bytes).toBe(150_000);
      const text = String(result.body);
      expect(Buffer.byteLength(text)).toBeLessThanOrEqual(64 * 1024 + Buffer.byteLength('…'));
      expect(text).not.toContain('\uFFFD');
      expect(text.endsWith('é…')).toBe(true);
    } finally {
      server.close();
    }
  });
});

describe('search', () => {
  const index = buildSearchIndex(catalog.operations);

  it('tokenizes camelCase, paths, plurals, and verb forms', () => {
    expect(tokenize('PostProductsId /admin/product-categories')).toEqual([
      'post',
      'product',
      'id',
      'admin',
      'product',
      'category',
    ]);
    expect(tokenize('shipped shipping orders')).toEqual(['ship', 'ship', 'order']);
  });

  it('reads one method intent from the query verbs', () => {
    expect(queryIntent('update a product')).toBe('POST');
    expect(queryIntent('list customers')).toBe('GET');
    expect(queryIntent('remove a tag')).toBe('DELETE');
    expect(queryIntent('list and delete')).toBeUndefined();
  });

  it('returns the same ranking for the same query', () => {
    const ranking = () => index.search('update product', {}, 10).map((result) => result.operation.operation);
    expect(ranking()).toEqual(ranking());
  });

  // Baseline measured on the pinned 2.22.1 spec: hit@1 11/15, hit@3 14/15. This guards against regressions.
  it('finds the expected operation for common agent tasks', () => {
    const cases: [string, string, { area?: 'admin' | 'store' }?][] = [
      ['update a product description', 'POST /admin/products/{id}'],
      ['list products', 'GET /admin/products', { area: 'admin' }],
      ['get a single order', 'GET /admin/orders/{id}'],
      ['create a promotion', 'POST /admin/promotions'],
      ['delete a product category', 'DELETE /admin/product-categories/{id}'],
      ['add an item to the cart', 'POST /store/carts/{id}/line-items'],
      ['list customers', 'GET /admin/customers'],
      [
        'set stock quantity for an inventory item at a location',
        'POST /admin/inventory-items/{id}/location-levels/{location_id}',
      ],
      ['refund a payment', 'POST /admin/payments/{id}/refund'],
      ['cancel an order', 'POST /admin/orders/{id}/cancel'],
      ['list regions', 'GET /store/regions', { area: 'store' }],
      ['complete cart checkout', 'POST /store/carts/{id}/complete'],
      ['change a product variant price', 'POST /admin/products/{id}/variants/{variant_id}'],
      ['mark an order fulfillment as shipped', 'POST /admin/orders/{id}/fulfillments/{fulfillment_id}/shipments'],
      ['find a product by handle in the storefront', 'GET /store/products', { area: 'store' }],
    ];
    const ranks = cases.map(([query, expected, filters]) => ({
      query,
      rank: index.search(query, filters ?? {}, 5).findIndex((result) => result.operation.operation === expected) + 1,
    }));
    const report = ranks.map(({ query, rank }) => `${rank || 'miss'}: ${query}`).join('\n');

    const hitAt1 = ranks.filter(({ rank }) => rank === 1).length;
    const hitAt3 = ranks.filter(({ rank }) => rank > 0 && rank <= 3).length;
    if (hitAt1 < 11 || hitAt3 < 14)
      throw new Error(`Search regressed: hit@1 ${hitAt1}/15, hit@3 ${hitAt3}/15\n${report}`);
    expect(ranks.find(({ query }) => query === 'update a product description')?.rank).toBe(1);
  });
});

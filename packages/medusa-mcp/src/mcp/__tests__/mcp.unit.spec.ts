import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import { buildApiSpec } from '../../openapi/build-spec';
import { buildCatalog } from '../catalog';
import { describeOperation } from '../describe';
import {
  type AuditEntry,
  appendQuery,
  buildRequestUrl,
  declaredParameters,
  ExecutionError,
  executeOperation,
} from '../execute';
import { BUILT_IN_BLOCKLIST, createPolicy } from '../policy';
import { buildSearchIndex, pathResource, queryIntent, queryTerms, tokenize } from '../search';
import { buildMcpServer, resourceIn } from '../server';

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
    // One ASCII byte first, so the 64 KiB cut lands inside a two-byte character.
    const body = `a${'é'.repeat(75_000)}`;
    const server = createServer((_req, res) =>
      res.writeHead(200, { 'content-type': 'text/plain', 'content-length': Buffer.byteLength(body) }).end(body),
    );
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const target = {
        baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
        adminToken: async () => 'jwt',
        publishableKey: async () => undefined,
      };
      const products = operation('GET /admin/products');
      const result = await executeOperation(target as never, products, declaredParameters(products), {});
      expect(result.truncated?.bytes).toBe(150_001);
      const text = String(result.body);
      expect(Buffer.byteLength(text)).toBeLessThanOrEqual(64 * 1024 + Buffer.byteLength('…'));
      expect(text).not.toContain('\uFFFD');
      expect(text.endsWith('é…')).toBe(true);
    } finally {
      server.close();
    }
  });

  it('stops reading an oversized response instead of buffering all of it', async () => {
    // A body that never ends: the call only returns if the client stops reading at the cap.
    let sent = 0;
    const server = createServer((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      const chunk = Buffer.alloc(16 * 1024, 'a');
      const pump = () => {
        while (!res.destroyed && res.write(chunk)) sent += chunk.length;
        if (!res.destroyed) res.once('drain', pump);
      };
      pump();
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const target = {
        baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
        adminToken: async () => 'jwt',
        publishableKey: async () => undefined,
      };
      const products = operation('GET /admin/products');
      const result = await executeOperation(target as never, products, declaredParameters(products), {});
      expect(result.truncated).toBeDefined();
      expect(result.truncated?.bytes).toBeUndefined();
      expect(Buffer.byteLength(String(result.body))).toBeLessThanOrEqual(64 * 1024 + Buffer.byteLength('…'));
      expect(sent).toBeLessThan(16 * 1024 * 1024);
    } finally {
      server.closeAllConnections();
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
    expect(tokenize("an existing product's new description")).toEqual(['product', 'description']);
  });

  it('weights terms in a detail clause at half, unless they also name the target', () => {
    expect(queryTerms('create a product with variants and options')).toEqual([
      { term: 'variant', weight: 0.5 },
      { term: 'option', weight: 0.5 },
      { term: 'create', weight: 1 },
      { term: 'product', weight: 1 },
    ]);
    expect(queryTerms('create a collection to group products')).toContainEqual({ term: 'group', weight: 0.5 });
    expect(queryTerms('add a product to a product list')).toContainEqual({ term: 'product', weight: 1 });
    // A marker before the verb does not start a clause.
    expect(queryTerms('how to create a product with variants')).toContainEqual({ term: 'product', weight: 1 });
    // When the head names no resource, the clause holds the target and keeps its weight.
    const resources = new Set(['item', 'location', 'product']);
    expect(queryTerms('set stock quantity for an inventory item', resources)).toContainEqual({
      term: 'item',
      weight: 1,
    });
  });

  it('keeps the inventory level update within the default five results', () => {
    const results = index.search('set stock quantity for an inventory item at a location');
    expect(results.map((result) => result.operation.operation)).toContain(
      'POST /admin/inventory-items/{id}/location-levels/{location_id}',
    );
  });

  it('reads the resource an operation acts on from the end of its path', () => {
    expect(pathResource('/admin/products/{id}/variants')).toBe('variant');
    expect(pathResource('/admin/payment-collections')).toBe('collection');
    expect(pathResource('/admin/products/{id}')).toBe('product');
  });

  it('reads an update verb as "update", the word Medusa summaries use, but leaves the same word as a noun', () => {
    expect(queryTerms("change a product's title")).toContainEqual({ term: 'update', weight: 1 });
    expect(queryTerms("change a product's title").map(({ term }) => term)).not.toContain('change');
    expect(queryTerms('list order changes').map(({ term }) => term)).toContain('change');
    const resources = new Set(['order', 'product']);
    expect(queryTerms('order change', resources).map(({ term }) => term)).toEqual(['order', 'change']);
    expect(queryTerms('how to rename a product', resources).map(({ term }) => term)).toContain('update');
    expect(queryTerms('alter a product')).toContainEqual({ term: 'update', weight: 1 });
    expect(queryIntent('alter a product')).toBe('POST');
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

  // Measured on the pinned 2.22.1 spec. The first 15 phrasings sit close to Medusa's summaries; the rest are written the
  // way agents ask, with qualifiers and detail clauses, and include the three that misranked live in ChatGPT. Before
  // modifier weighting and the path-resource boost: hit@1 18/34, hit@3 25/34. With them: 26/35 and 31/35. The last four,
  // update verbs Medusa's summaries never use, ranked 3rd to 8th before those verbs read as "update". Now: hit@1 31/39,
  // hit@3 35/39.
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
      ['create a new customer with an email address', 'POST /admin/customers'],
      ['add a product to a sales channel', 'POST /admin/sales-channels/{id}/products'],
      ['change the title of an existing collection', 'POST /admin/collections/{id}'],
      ['remove a product from a collection', 'POST /admin/collections/{id}/products'],
      ['create a discount code for 10% off', 'POST /admin/promotions'],
      ['look up an order by its display id', 'GET /admin/orders'],
      ['archive a product by setting its status', 'POST /admin/products/{id}'],
      ['create a price list for wholesale customers', 'POST /admin/price-lists'],
      ['add a tag to a product', 'POST /admin/products/{id}'],
      ['create a product category under a parent category', 'POST /admin/product-categories'],
      ['delete a customer group', 'DELETE /admin/customer-groups/{id}'],
      ['list the variants of a product', 'GET /admin/products/{id}/variants'],
      ['create a shipping option for a region', 'POST /admin/shipping-options'],
      [
        'update the inventory quantity of a variant at a stock location',
        'POST /admin/inventory-items/{id}/location-levels/{location_id}',
      ],
      ['create a stock location for a warehouse', 'POST /admin/stock-locations'],
      ['get a customer by id', 'GET /admin/customers/{id}'],
      ['create a product as draft with variants and options', 'POST /admin/products'],
      ["update an existing product's description", 'POST /admin/products/{id}'],
      ['create a product collection to group products', 'POST /admin/collections'],
      ['how to create a product with variants', 'POST /admin/products'],
      ["change a product's title", 'POST /admin/products/{id}'],
      ['rename a product', 'POST /admin/products/{id}'],
      ['edit a product description', 'POST /admin/products/{id}'],
      ['modify a customer email', 'POST /admin/customers/{id}'],
    ];
    const ranks = cases.map(([query, expected, filters]) => ({
      query,
      rank: index.search(query, filters ?? {}, 10).findIndex((result) => result.operation.operation === expected) + 1,
    }));
    const report = ranks.map(({ query, rank }) => `${rank || 'miss'}: ${query}`).join('\n');

    const hitAt1 = ranks.filter(({ rank }) => rank === 1).length;
    const hitAt3 = ranks.filter(({ rank }) => rank > 0 && rank <= 3).length;
    if (hitAt1 < 31 || hitAt3 < 35)
      throw new Error(`Search regressed: hit@1 ${hitAt1}/${cases.length}, hit@3 ${hitAt3}/${cases.length}\n${report}`);
    for (const query of [
      'update a product description',
      'create a product as draft with variants and options',
      "update an existing product's description",
      'create a product collection to group products',
      'how to create a product with variants',
      "change a product's title",
    ]) {
      expect({ query, rank: ranks.find((entry) => entry.query === query)?.rank }).toEqual({ query, rank: 1 });
    }
  });
});

describe('resourceIn', () => {
  it('finds the resource nested under its key, or returned directly, and nothing in an empty body', () => {
    expect(resourceIn({ product: { id: 'prod_1' } })).toEqual({ id: 'prod_1' });
    expect(resourceIn({ id: 'custom_1', title: 'Direct' })).toEqual({ id: 'custom_1', title: 'Direct' });
    expect(resourceIn({})).toBeUndefined();
    expect(resourceIn('{"product":')).toBeUndefined();
    expect(resourceIn(undefined)).toBeUndefined();
  });
});

describe('a call that cannot reach Medusa', () => {
  it('returns a structured interrupted failure, and says whether a write may have landed', async () => {
    const closed = createServer();
    await new Promise<void>((resolve) => closed.listen(0, '127.0.0.1', resolve));
    const { port } = closed.address() as AddressInfo;
    await new Promise((resolve) => closed.close(resolve));
    const audit: AuditEntry[] = [];
    const toolsFor = (record: (entry: AuditEntry) => Promise<void>) => {
      const server = buildMcpServer(
        { catalog, search: buildSearchIndex(catalog.operations), builtAt: new Date() },
        {
          scopes: ['mcp:read', 'mcp:write', 'mcp:delete'],
          tokenId: 'token',
          audit: record,
          baseUrl: `http://127.0.0.1:${port}`,
          adminToken: async () => 'admin',
          publishableKey: async () => undefined,
        },
      );
      return (
        server as unknown as {
          _registeredTools: Record<string, { executor: (args: unknown) => Promise<Record<string, any>> }>;
        }
      )._registeredTools;
    };
    const tools = toolsFor(async (entry) => {
      audit.push(entry);
    });
    const call = (name: string, args: Record<string, unknown>) => tools[name].executor(args);
    const product = { operation: 'POST /admin/products/{id}', path_params: { id: 'prod_1' } };

    const read = await call('read_api', { operation: 'GET /admin/products' });
    const write = await call('write_api', { ...product, body: { description: 'x' } });
    const preview = await call('write_api', { ...product, body: { description: 'x' }, dry_run: true });
    const remove = await call('delete_api', {
      operation: 'DELETE /admin/products/{id}',
      path_params: { id: 'prod_1' },
    });

    for (const result of [read, write, preview, remove]) {
      expect(result.isError).toBe(true);
      expect(result.structuredContent).toMatchObject({
        error: { phase: 'interrupted' },
        spec_revision: expect.any(String),
      });
      expect(result.content[0].text).toContain(JSON.stringify(result.structuredContent));
    }
    expect(read.structuredContent?.error.hint).toBe('Nothing was changed. Call again.');
    expect(preview.structuredContent?.error.hint).toBe('Nothing was changed. Call again.');
    expect(write.structuredContent?.error.hint).toContain('may have applied');
    expect(remove.structuredContent?.error.hint).toContain('may have applied');
    expect(audit.map(({ operation, outcome }) => `${outcome} ${operation}`)).toEqual([
      'failed POST /admin/products/{id}',
      'failed POST /admin/products/{id}',
      'failed DELETE /admin/products/{id}',
    ]);
  });

  it.each([
    [
      'rejects',
      async () => {
        throw new Error('audit store down');
      },
    ],
    [
      'throws',
      (): Promise<void> => {
        throw new Error('audit store down');
      },
    ],
  ])('returns the same structured result when the audit %s', async (_, failingAudit) => {
    const tools = (
      buildMcpServer(
        { catalog, search: buildSearchIndex(catalog.operations), builtAt: new Date() },
        {
          scopes: ['mcp:read', 'mcp:write', 'mcp:delete'],
          tokenId: 'token',
          audit: failingAudit,
          baseUrl: 'http://127.0.0.1:1',
          adminToken: async () => 'admin',
          publishableKey: async () => undefined,
        },
      ) as unknown as {
        _registeredTools: Record<string, { executor: (args: unknown) => Promise<Record<string, any>> }>;
      }
    )._registeredTools;
    const write = (args: Record<string, unknown>) => tools.write_api.executor(args);
    const product = { operation: 'POST /admin/products/{id}', path_params: { id: 'prod_1' } };

    const sent = await write({ ...product, body: { description: 'x' } });
    const blocked = await write({ operation: 'POST /admin/api-keys', body: { title: 'key', type: 'secret' } });
    const invalid = await write({ ...product, body: { description: 42 } });
    const preview = await write({ operation: 'POST /admin/products', body: { title: 'x' }, dry_run: true });

    expect(sent.structuredContent?.error).toMatchObject({ phase: 'interrupted', hint: expect.stringContaining('may') });
    expect(blocked.structuredContent?.error).toMatchObject({ phase: 'refused' });
    expect(invalid.structuredContent?.error).toMatchObject({ phase: 'schema' });
    expect(preview.structuredContent).toMatchObject({ dry_run: true, executed: false });
  });
});

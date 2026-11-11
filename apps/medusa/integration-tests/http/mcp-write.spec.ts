import { Modules, ProductStatus } from '@medusajs/framework/utils';
import { medusaIntegrationTestRunner } from '@medusajs/test-utils';
import { type Api, createAdmin, issueAccessToken } from './helpers/oauth';

jest.setTimeout(90 * 1000);

async function rpc(api: Api, method: string, params: Record<string, unknown>, token: string) {
  const response = await api.post(
    '/mcp',
    { jsonrpc: '2.0', id: 1, method, params },
    {
      validateStatus: () => true,
      responseType: 'text',
      headers: {
        accept: 'application/json, text/event-stream',
        'mcp-protocol-version': '2025-06-18',
        authorization: `Bearer ${token}`,
      },
    },
  );
  const text = String(response.data);
  const json = text.trimStart().startsWith('{')
    ? text
    : text
        .split('\n')
        .find((line) => line.startsWith('data:'))
        ?.slice(5);
  return { status: response.status, headers: response.headers, message: json ? JSON.parse(json) : undefined };
}

async function callTool(api: Api, token: string, name: string, args: Record<string, unknown>) {
  const { status, message } = await rpc(api, 'tools/call', { name, arguments: args }, token);
  expect(status).toBe(200);
  return message.result as { isError?: boolean; structuredContent?: Record<string, any>; content: { text: string }[] };
}

medusaIntegrationTestRunner({
  env: {},
  testSuite: ({ api, getContainer }) => {
    let fullToken: string;
    let productId: string;
    const product = () => getContainer().resolve(Modules.PRODUCT).retrieveProduct(productId);

    beforeEach(async () => {
      await createAdmin(api, getContainer());
      fullToken = (await issueAccessToken(api, ['mcp:read', 'mcp:write', 'mcp:delete'])).access_token;
      const [created] = await getContainer()
        .resolve(Modules.PRODUCT)
        .createProducts([
          {
            title: 'Barrio Decaf - Medium Roast',
            handle: 'barrio-decaf-medium-roast',
            description: 'Smooth and sweet.',
            status: ProductStatus.PUBLISHED,
          },
        ]);
      productId = created.id;
    });

    it('lists write and delete tools with honest annotations and scopes', async () => {
      const { message } = await rpc(api, 'tools/list', {}, fullToken);
      const tools = Object.fromEntries(
        (message.result.tools as { name: string; annotations: unknown; _meta: unknown }[]).map((tool) => [
          tool.name,
          tool,
        ]),
      );
      expect(Object.keys(tools)).toEqual(['search_api', 'describe_api', 'read_api', 'write_api', 'delete_api']);
      expect(tools.write_api).toMatchObject({
        annotations: { readOnlyHint: false, destructiveHint: false },
        _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['mcp:write'] }] },
      });
      expect(tools.delete_api).toMatchObject({
        annotations: { readOnlyHint: false, destructiveHint: true },
        _meta: { securitySchemes: [{ type: 'oauth2', scopes: ['mcp:delete'] }] },
      });
    });

    it('previews a description change without writing, then applies it', async () => {
      const change = {
        operation: 'POST /admin/products/{id}',
        path_params: { id: productId },
        body: { description: 'Rich, chocolatey, and caffeine-free.' },
      };

      const preview = await callTool(api, fullToken, 'write_api', { ...change, dry_run: true });
      expect(preview.structuredContent).toEqual({
        operation: 'POST /admin/products/{id}',
        dry_run: true,
        executed: false,
        schema_check: 'passed',
        limits: expect.stringContaining('Nothing was sent to Medusa'),
        changes: [
          { field: 'description', current: 'Smooth and sweet.', proposed: 'Rich, chocolatey, and caffeine-free.' },
        ],
      });
      expect((await product()).description).toBe('Smooth and sweet.');

      const applied = await callTool(api, fullToken, 'write_api', change);
      expect(applied.isError).toBeFalsy();
      expect(applied.structuredContent).toMatchObject({
        status: 200,
        body: { product: { id: productId, description: 'Rich, chocolatey, and caffeine-free.' } },
      });
      expect((await product()).description).toBe('Rich, chocolatey, and caffeine-free.');
    });

    it('rejects a body that does not match the schema before calling Medusa', async () => {
      const rejected = await callTool(api, fullToken, 'write_api', {
        operation: 'POST /admin/products/{id}',
        path_params: { id: productId },
        body: { description: 42 },
      });
      expect(rejected.isError).toBe(true);
      expect(rejected.content[0].text).toContain('/description must be string');
      expect(rejected.structuredContent).toMatchObject({
        operation: 'POST /admin/products/{id}',
        error: { phase: 'schema', problems: [expect.stringContaining('/description must be string')] },
        spec_revision: expect.any(String),
      });
      expect((await product()).description).toBe('Smooth and sweet.');
    });

    it('needs mcp:write to write and mcp:delete to delete', async () => {
      const readOnly = (await issueAccessToken(api, ['mcp:read'])).access_token;
      const write = await rpc(
        api,
        'tools/call',
        { name: 'write_api', arguments: { operation: 'POST /admin/products/{id}', path_params: { id: productId } } },
        readOnly,
      );
      expect(write.status).toBe(403);
      expect(write.headers['www-authenticate']).toContain('scope="mcp:write"');

      const writer = (await issueAccessToken(api, ['mcp:read', 'mcp:write'])).access_token;
      const remove = await rpc(
        api,
        'tools/call',
        { name: 'delete_api', arguments: { operation: 'DELETE /admin/products/{id}', path_params: { id: productId } } },
        writer,
      );
      expect(remove.status).toBe(403);
      expect(remove.headers['www-authenticate']).toContain('scope="mcp:delete"');
      expect((await product()).id).toBe(productId);
    });

    it('deletes with delete_api', async () => {
      const deleted = await callTool(api, fullToken, 'delete_api', {
        operation: 'DELETE /admin/products/{id}',
        path_params: { id: productId },
      });
      expect(deleted.structuredContent).toMatchObject({ status: 200, body: { id: productId, deleted: true } });
      await expect(product()).rejects.toThrow();
    });

    it('refuses blocked writes and the wrong tool for an operation', async () => {
      const blocked = await callTool(api, fullToken, 'write_api', {
        operation: 'POST /admin/api-keys',
        body: { title: 'agent key', type: 'secret' },
      });
      expect(blocked.content[0].text).toContain('blocked for agents');

      const wrongTool = await callTool(api, fullToken, 'write_api', {
        operation: 'DELETE /admin/products/{id}',
        path_params: { id: productId },
      });
      expect(wrongTool.content[0].text).toContain('Use delete_api');
    });

    it('audits refused, executed, and previewed write attempts with their path parameters', async () => {
      const logger = getContainer().resolve('logger') as { info: (message: string) => void };
      const info = jest.spyOn(logger, 'info');
      try {
        await callTool(api, fullToken, 'write_api', {
          operation: 'POST /admin/api-keys',
          body: { title: 'x', type: 'secret' },
        });
        await callTool(api, fullToken, 'write_api', { operation: 'POST /admin/nothing', body: {} });
        await callTool(api, fullToken, 'write_api', {
          operation: 'POST /admin/products/{id}',
          path_params: { id: productId },
          body: { description: 'Audited.' },
        });

        const entries = info.mock.calls
          .map(([message]) => String(message))
          .filter((message) => message.startsWith('[medusa-mcp] '))
          .map((message) => JSON.parse(message.slice('[medusa-mcp] '.length)));
        expect(entries).toEqual([
          expect.objectContaining({
            operation: 'POST /admin/api-keys',
            outcome: 'refused',
            reason: expect.stringContaining('blocked for agents'),
          }),
          expect.objectContaining({
            operation: 'POST /admin/nothing',
            outcome: 'refused',
            reason: expect.stringContaining('Unknown operation'),
          }),
          expect.objectContaining({
            operation: 'POST /admin/products/{id}',
            path_params: { id: productId },
            outcome: 'executed',
            status: 200,
            spec_revision: expect.any(String),
          }),
        ]);
      } finally {
        info.mockRestore();
      }
    });

    it("says a dry run cannot predict business rules, and returns Medusa's rejection in a form an agent can act on", async () => {
      // From the live ChatGPT smoke test: the published schema makes `options` optional, but Medusa's create workflow
      // rejects a product without options. No schema can see that rule, so the dry run must not imply acceptance and
      // the real rejection must say what to fix.
      const products = getContainer().resolve(Modules.PRODUCT);
      const before = await products.listProducts({}, { select: ['id'] });
      const draft = { title: 'MCP smoke test', handle: 'mcp-smoke-test', status: 'draft' };

      const preview = await callTool(api, fullToken, 'write_api', {
        operation: 'POST /admin/products',
        body: draft,
        dry_run: true,
      });
      expect(preview.isError).toBeFalsy();
      expect(preview.structuredContent).toEqual({
        operation: 'POST /admin/products',
        dry_run: true,
        executed: false,
        schema_check: 'passed',
        limits: expect.stringContaining('the real call can still be rejected'),
        proposed: draft,
        current: null,
        note: '"Create Product" does not target one existing resource by its path, so there are no current values to compare.',
      });

      const rejected = await callTool(api, fullToken, 'write_api', { operation: 'POST /admin/products', body: draft });
      expect(rejected.isError).toBe(true);
      expect(rejected.structuredContent).toMatchObject({
        operation: 'POST /admin/products',
        status: 400,
        error: {
          phase: 'medusa',
          status: 400,
          type: 'invalid_data',
          message: expect.stringContaining('Product options are not provided'),
          hint: expect.stringContaining('business rules'),
        },
        spec_revision: expect.any(String),
      });

      const created = await callTool(api, fullToken, 'write_api', {
        operation: 'POST /admin/products',
        body: {
          ...draft,
          options: [{ title: 'Format', values: ['Test'] }],
          variants: [{ title: 'Test', sku: 'MCP-SMOKE', options: { Format: 'Test' }, prices: [] }],
        },
      });
      expect(created.isError).toBeFalsy();
      const createdId = created.structuredContent?.body.product.id as string;

      const deleted = await callTool(api, fullToken, 'delete_api', {
        operation: 'DELETE /admin/products/{id}',
        path_params: { id: createdId },
      });
      expect(deleted.structuredContent).toMatchObject({ status: 200, body: { id: createdId, deleted: true } });
      expect(await products.listProducts({ handle: 'mcp-smoke-test' })).toHaveLength(0);
      expect(await products.listProducts({}, { select: ['id'] })).toHaveLength(before.length);
    });

    it('says when a dry run checked nothing against the schema', async () => {
      const preview = await callTool(api, fullToken, 'write_api', { operation: 'POST /admin/products', dry_run: true });
      expect(preview.isError).toBeFalsy();
      expect(preview.structuredContent).toMatchObject({
        executed: false,
        schema_check: 'no_body',
        limits: expect.stringContaining('No body was given, so nothing was checked'),
        proposed: null,
      });
      expect(preview.structuredContent?.limits).not.toContain('matches the published schema');

      const action = await callTool(api, fullToken, 'write_api', {
        operation: 'POST /admin/products/export',
        dry_run: true,
      });
      expect(action.structuredContent?.note).toBe(
        '"Export Products" does not target one existing resource by its path, so there are no current values to compare.',
      );
    });

    it('does not show current values in a dry run for a token without mcp:read', async () => {
      const writeOnly = (await issueAccessToken(api, ['mcp:write'])).access_token;
      const preview = await callTool(api, writeOnly, 'write_api', {
        operation: 'POST /admin/products/{id}',
        path_params: { id: productId },
        body: { description: 'Proposed.' },
        dry_run: true,
      });
      expect(preview.structuredContent).toEqual({
        operation: 'POST /admin/products/{id}',
        dry_run: true,
        executed: false,
        schema_check: 'passed',
        limits: expect.stringContaining('Nothing was sent to Medusa'),
        proposed: { description: 'Proposed.' },
        current: null,
        note: 'Current values need the mcp:read scope.',
      });
      expect(JSON.stringify(preview)).not.toContain('Smooth and sweet.');
    });

    it('limits writes per token per minute', async () => {
      const limiter = (await issueAccessToken(api, ['mcp:read', 'mcp:write'])).access_token;
      const preview = {
        operation: 'POST /admin/products/{id}',
        path_params: { id: productId },
        body: { title: 'x' },
        dry_run: true,
      };
      for (let attempt = 0; attempt < 30; attempt++) {
        expect((await callTool(api, limiter, 'write_api', preview)).isError).toBeFalsy();
      }
      const limited = await callTool(api, limiter, 'write_api', preview);
      expect(limited.content[0].text).toContain('Rate limit reached');
    });
  },
});

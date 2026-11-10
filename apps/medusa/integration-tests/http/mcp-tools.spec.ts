import type McpOAuthService from '@lambdacurry/medusa-mcp/modules/mcp_oauth/service';
import { Modules, ProductStatus } from '@medusajs/framework/utils';
import { medusaIntegrationTestRunner } from '@medusajs/test-utils';
import { type Api, createAdmin, issueAccessToken, RESOURCE } from './helpers/oauth';

jest.setTimeout(60 * 1000);

const RESOURCE_METADATA = 'http://localhost:9000/.well-known/oauth-protected-resource/mcp';

/** One stateless MCP JSON-RPC call over Streamable HTTP, returning the HTTP status and the JSON-RPC message. */
async function rpc(api: Api, method: string, params: Record<string, unknown>, token?: string) {
  const response = await api.post(
    '/mcp',
    { jsonrpc: '2.0', id: 1, method, params },
    {
      validateStatus: () => true,
      responseType: 'text',
      headers: {
        accept: 'application/json, text/event-stream',
        'mcp-protocol-version': '2025-06-18',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
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
    let admin: { userId: string; authIdentityId: string };
    let readToken: string;
    let productId: string;

    beforeEach(async () => {
      const container = getContainer();
      admin = await createAdmin(api, container);
      readToken = (await issueAccessToken(api, ['mcp:read'])).access_token;
      const [product] = await container.resolve(Modules.PRODUCT).createProducts([
        {
          title: 'Barrio Decaf - Medium Roast',
          handle: 'barrio-decaf-medium-roast',
          description: 'Smooth and sweet.',
          status: ProductStatus.PUBLISHED,
        },
      ]);
      productId = product.id;
      await container.resolve(Modules.API_KEY).createApiKeys({
        title: 'Storefront',
        type: 'publishable',
        created_by: admin.userId,
      });
    });

    describe('authentication', () => {
      it('challenges requests without a token so clients can discover the authorization server', async () => {
        const { status, headers } = await rpc(api, 'tools/list', {});
        expect(status).toBe(401);
        expect(headers['www-authenticate']).toBe(`Bearer resource_metadata="${RESOURCE_METADATA}"`);
      });

      it('rejects unknown tokens with invalid_token', async () => {
        const { status, headers } = await rpc(api, 'tools/list', {}, 'mcp_at_not-a-token');
        expect(status).toBe(401);
        expect(headers['www-authenticate']).toContain('error="invalid_token"');
      });

      it('answers a token without mcp:read with a 403 insufficient_scope challenge', async () => {
        const writeOnly = (await issueAccessToken(api, ['mcp:write'])).access_token;
        const { status, headers } = await rpc(
          api,
          'tools/call',
          { name: 'search_api', arguments: { query: 'products' } },
          writeOnly,
        );
        expect(status).toBe(403);
        expect(headers['www-authenticate']).toContain('error="insufficient_scope"');
        expect(headers['www-authenticate']).toContain('scope="mcp:read"');
        expect(headers['www-authenticate']).toContain(`resource_metadata="${RESOURCE_METADATA}"`);
      });

      it('revokes tokens of an admin who no longer exists', async () => {
        await getContainer().resolve(Modules.USER).deleteUsers([admin.userId]);
        await getContainer()
          .resolve(Modules.AUTH)
          .updateAuthIdentities({ id: admin.authIdentityId, app_metadata: { user_id: null } });
        const { status, headers } = await rpc(api, 'tools/list', {}, readToken);
        expect(status).toBe(401);
        expect(headers['www-authenticate']).toContain('no longer exists');
        const oauth = getContainer().resolve<McpOAuthService>('mcp_oauth');
        expect(await oauth.verifyAccessToken(readToken, RESOURCE)).toBeUndefined();
      });
    });

    describe('tools', () => {
      it('lists the read tools with read-only annotations and their OAuth scope', async () => {
        const { message } = await rpc(api, 'tools/list', {}, readToken);
        const tools = message.result.tools as { name: string; annotations: Record<string, boolean>; _meta: unknown }[];
        const readTools = tools.filter((tool) => ['search_api', 'describe_api', 'read_api'].includes(tool.name));
        expect(readTools.map((tool) => tool.name)).toEqual(['search_api', 'describe_api', 'read_api']);
        for (const tool of readTools) {
          expect(tool.annotations).toMatchObject({ readOnlyHint: true, destructiveHint: false });
          expect(tool._meta).toEqual({ securitySchemes: [{ type: 'oauth2', scopes: ['mcp:read'] }] });
        }
      });

      it('finds and describes the product update operation', async () => {
        const search = await callTool(api, readToken, 'search_api', { query: 'update a product description' });
        expect(search.structuredContent?.results[0]).toMatchObject({
          operation: 'POST /admin/products/{id}',
          operation_id: 'PostProductsId',
          tool: 'write_api',
        });
        expect(search.structuredContent?.index).toMatchObject({
          medusa_version: '2.22.1',
          undocumented_operations: 10,
        });

        const describe = await callTool(api, readToken, 'describe_api', { operation: 'POST /admin/products/{id}' });
        expect(describe.structuredContent).toMatchObject({ path_params: [{ name: 'id' }], tool: 'write_api' });
        expect(JSON.stringify(describe.structuredContent?.request_body)).toContain('"description"');
      });

      it('reads admin data as the signed-in admin and store data with a publishable key', async () => {
        const products = await callTool(api, readToken, 'read_api', {
          operation: 'GET /admin/products',
          query: { q: 'Decaf', fields: 'id,title,description', limit: 1 },
        });
        expect(products.isError).toBeFalsy();
        expect(products.structuredContent).toMatchObject({
          status: 200,
          body: {
            products: [{ id: productId, title: 'Barrio Decaf - Medium Roast', description: 'Smooth and sweet.' }],
          },
        });

        const one = await callTool(api, readToken, 'read_api', {
          operation: 'GET /admin/products/{id}',
          path_params: { id: productId },
          query: { fields: 'id,handle' },
        });
        expect(one.structuredContent?.body).toEqual({
          product: { id: productId, handle: 'barrio-decaf-medium-roast' },
        });

        const regions = await callTool(api, readToken, 'read_api', { operation: 'GET /store/regions' });
        expect(regions.structuredContent).toMatchObject({ status: 200, body: { regions: [] } });
      });

      it('refuses blocked operations, writes, unknown parameters, and unknown operations', async () => {
        const blocked = await callTool(api, readToken, 'read_api', { operation: 'GET /admin/api-keys' });
        expect(blocked).toMatchObject({ isError: true });
        expect(blocked.content[0].text).toContain('blocked for agents');

        const write = await callTool(api, readToken, 'read_api', {
          operation: 'POST /admin/products/{id}',
          path_params: { id: productId },
        });
        expect(write.content[0].text).toContain('Use write_api');

        const unknownQuery = await callTool(api, readToken, 'read_api', {
          operation: 'GET /admin/products',
          query: { not_a_param: 1 },
        });
        expect(unknownQuery.content[0].text).toContain('Unknown query parameter');

        const unknown = await callTool(api, readToken, 'describe_api', { operation: 'GET /admin/nothing' });
        expect(unknown).toMatchObject({ isError: true });
      });

      it('reports Medusa errors without failing the tool call', async () => {
        const missing = await callTool(api, readToken, 'read_api', {
          operation: 'GET /admin/products/{id}',
          path_params: { id: 'prod_missing' },
        });
        expect(missing).toMatchObject({ isError: true, structuredContent: { status: 404 } });
      });
    });
  },
});

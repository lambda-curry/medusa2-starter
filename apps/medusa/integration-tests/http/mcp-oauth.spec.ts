import type McpOAuthService from '@lambdacurry/medusa-mcp/modules/mcp_oauth/service';
import { medusaIntegrationTestRunner } from '@medusajs/test-utils';

jest.setTimeout(60 * 1000);

const CHATGPT_CLIENT_ID = 'https://chatgpt.com/oauth/client.json';
const chatgptDocument = {
  client_id: CHATGPT_CLIENT_ID,
  client_name: 'ChatGPT',
  redirect_uris: ['https://chatgpt.com/connector_platform_oauth_redirect'],
  token_endpoint_auth_methods_supported: ['none', 'private_key_jwt'],
};

async function expectOAuthError(request: Promise<unknown>, status: number, error: string) {
  await expect(request).rejects.toMatchObject({ response: { status, data: { error } } });
}

medusaIntegrationTestRunner({
  env: {},
  testSuite: ({ api, getContainer }) => {
    const oauth = () => getContainer().resolve<McpOAuthService>('mcp_oauth');

    describe('OAuth discovery', () => {
      it('publishes authorization server metadata with PKCE, CIMD, and iss support', async () => {
        const { status, data } = await api.get('/.well-known/oauth-authorization-server');
        expect(status).toBe(200);
        expect(data).toMatchObject({
          issuer: 'http://localhost:9000',
          authorization_endpoint: 'http://localhost:9000/oauth/authorize',
          token_endpoint: 'http://localhost:9000/oauth/token',
          registration_endpoint: 'http://localhost:9000/oauth/register',
          code_challenge_methods_supported: ['S256'],
          token_endpoint_auth_methods_supported: ['none'],
          scopes_supported: ['mcp:read', 'mcp:write', 'mcp:delete'],
          client_id_metadata_document_supported: true,
          authorization_response_iss_parameter_supported: true,
        });
      });

      it('publishes protected resource metadata at the path-inserted and root well-known URLs', async () => {
        const pathForm = await api.get('/.well-known/oauth-protected-resource/mcp');
        const rootForm = await api.get('/.well-known/oauth-protected-resource');
        expect(pathForm.data).toEqual({
          resource: 'http://localhost:9000/mcp',
          authorization_servers: ['http://localhost:9000'],
          scopes_supported: ['mcp:read', 'mcp:write', 'mcp:delete'],
          bearer_methods_supported: ['header'],
          resource_name: 'Medusa MCP',
        });
        expect(rootForm.data).toEqual(pathForm.data);
      });
    });

    describe('Dynamic Client Registration', () => {
      it('registers a public client and can resolve it afterwards', async () => {
        const { status, data } = await api.post('/oauth/register', {
          client_name: 'MCP Inspector',
          redirect_uris: ['http://localhost:6274/oauth/callback'],
        });
        expect(status).toBe(201);
        expect(data).toMatchObject({
          client_id: expect.stringMatching(/^mcpdcr_/),
          client_name: 'MCP Inspector',
          token_endpoint_auth_method: 'none',
          grant_types: ['authorization_code', 'refresh_token'],
          response_types: ['code'],
        });

        const client = await oauth().resolveClient(data.client_id);
        expect(client).toMatchObject({ registration: 'dcr', redirect_uris: ['http://localhost:6274/oauth/callback'] });
      });

      it('rejects non-loopback http redirects, confidential clients, and unsupported grants', async () => {
        await expectOAuthError(
          api.post('/oauth/register', { redirect_uris: ['http://evil.example/cb'] }),
          400,
          'invalid_redirect_uri',
        );
        await expectOAuthError(
          api.post('/oauth/register', {
            redirect_uris: ['https://a.example/cb'],
            token_endpoint_auth_method: 'client_secret_basic',
          }),
          400,
          'invalid_client_metadata',
        );
        await expectOAuthError(
          api.post('/oauth/register', { redirect_uris: ['https://a.example/cb'], grant_types: ['password'] }),
          400,
          'invalid_client_metadata',
        );
      });

      it('does not resolve unknown opaque client ids', async () => {
        await expect(oauth().resolveClient('mcpdcr_unknown')).rejects.toMatchObject({ code: 'invalid_client' });
      });
    });

    describe('Client ID Metadata Documents', () => {
      it('fetches, stores, and caches a valid document', async () => {
        const fetched: string[] = [];
        await oauth().setFetchJson(async (url) => {
          fetched.push(url);
          return chatgptDocument;
        });

        const client = await oauth().resolveClient(CHATGPT_CLIENT_ID);
        expect(client).toMatchObject({
          client_id: CHATGPT_CLIENT_ID,
          registration: 'cimd',
          client_name: 'ChatGPT',
          redirect_uris: chatgptDocument.redirect_uris,
        });
        await oauth().resolveClient(CHATGPT_CLIENT_ID);
        expect(fetched).toEqual([CHATGPT_CLIENT_ID]);
      });

      it('resolves concurrent first requests for a new client to one stored client', async () => {
        const clientId = 'https://agent.example/oauth/client.json';
        await oauth().setFetchJson(async () => ({ ...chatgptDocument, client_id: clientId }));
        const resolved = await Promise.all(Array.from({ length: 5 }, () => oauth().resolveClient(clientId)));
        expect(new Set(resolved.map((client) => client.client_id))).toEqual(new Set([clientId]));
        expect(await oauth().listMcpOAuthClients({ client_id: clientId })).toHaveLength(1);
      });

      it('rejects a document that names a different client_id', async () => {
        await oauth().setFetchJson(async () => ({ ...chatgptDocument, client_id: 'https://evil.example/client.json' }));
        await expect(oauth().resolveClient('https://evil.example/other.json')).rejects.toMatchObject({
          code: 'invalid_client',
          message: expect.stringMatching(/does not match the URL/),
        });
      });

      it('never fetches http client ids', async () => {
        const fetched: string[] = [];
        await oauth().setFetchJson(async (url) => {
          fetched.push(url);
          return chatgptDocument;
        });
        await expect(oauth().resolveClient('http://chatgpt.com/oauth/client.json')).rejects.toMatchObject({
          code: 'invalid_client',
        });
        expect(fetched).toEqual([]);
      });
    });
  },
});

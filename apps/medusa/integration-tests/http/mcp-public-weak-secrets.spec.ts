import { medusaIntegrationTestRunner } from '@medusajs/test-utils';

jest.setTimeout(60 * 1000);

// Set before medusa-config is read. The runner's `env` option is applied too late for plugin options, and each
// HTTP integration file runs in its own process, so this does not leak into other suites.
Object.assign(process.env, {
  MCP_ISSUER: 'https://mcp.example.test',
  JWT_SECRET: 'supersecret',
  COOKIE_SECRET: 'supersecret',
});

// A public issuer with Medusa's default signing secrets would let anyone forge admin tokens through the tunnel.
medusaIntegrationTestRunner({
  env: {},
  testSuite: ({ api }) => {
    it('refuses OAuth, MCP, and discovery while the secrets are weak, and leaves the rest of Medusa alone', async () => {
      const options = { validateStatus: () => true };
      for (const response of [
        await api.get('/.well-known/oauth-authorization-server', options),
        await api.get('/.well-known/oauth-protected-resource/mcp', options),
        await api.post('/oauth/register', { redirect_uris: ['https://a.example/cb'] }, options),
        await api.post('/mcp', { jsonrpc: '2.0', id: 1, method: 'tools/list' }, options),
      ]) {
        expect(response.status).toBe(503);
        expect(response.data).toMatchObject({
          error: 'server_misconfigured',
          error_description: expect.stringContaining('JWT_SECRET and COOKIE_SECRET'),
        });
      }
      expect((await api.get('/health')).status).toBe(200);
    });
  },
});

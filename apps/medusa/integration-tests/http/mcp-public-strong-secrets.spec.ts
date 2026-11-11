import { medusaIntegrationTestRunner } from '@medusajs/test-utils';

jest.setTimeout(60 * 1000);

// Set before medusa-config is read. The runner's `env` option is applied too late for plugin options, and each
// HTTP integration file runs in its own process, so this does not leak into other suites.
Object.assign(process.env, {
  MCP_ISSUER: 'https://mcp.example.test',
  JWT_SECRET: 'a-strong-random-jwt-secret-for-tests',
  COOKIE_SECRET: 'a-strong-random-cookie-secret-for-tests',
});

medusaIntegrationTestRunner({
  env: {},
  testSuite: ({ api }) => {
    it('serves discovery for a public issuer once the secrets are strong', async () => {
      const { status, data } = await api.get('/.well-known/oauth-authorization-server');
      expect(status).toBe(200);
      expect(data).toMatchObject({
        issuer: 'https://mcp.example.test',
        token_endpoint: 'https://mcp.example.test/oauth/token',
      });
    });
  },
});

import { createHash, randomBytes } from 'node:crypto';
import type McpOAuthService from '@lambdacurry/medusa-mcp/modules/mcp_oauth/service';
import type { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { medusaIntegrationTestRunner } from '@medusajs/test-utils';

jest.setTimeout(60 * 1000);

const ISSUER = 'http://localhost:9000';
const RESOURCE = `${ISSUER}/mcp`;
const REDIRECT_URI = 'http://localhost:6274/oauth/callback';
const ADMIN = { email: 'mcp-admin@example.com', password: 'correct horse battery staple' };

// biome-ignore lint/suspicious/noExplicitAny: the test runner's axios instance is untyped.
type Api = any;
const noFollow = { maxRedirects: 0, validateStatus: () => true };
const formHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

function hiddenField(html: string, name: string): string {
  const value = html.match(new RegExp(`name="${name}" value="([^"]+)"`))?.[1];
  if (!value) throw new Error(`No hidden ${name} field in:\n${html.slice(0, 500)}`);
  return value.replaceAll('&quot;', '"').replaceAll('&amp;', '&');
}

function pkce() {
  const verifier = randomBytes(32).toString('base64url');
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') };
}

async function createAdmin(api: Api, container: MedusaContainer) {
  const { data } = await api.post('/auth/user/emailpass/register', ADMIN);
  const { auth_identity_id } = JSON.parse(Buffer.from(data.token.split('.')[1], 'base64url').toString('utf8'));
  const user = await container.resolve(Modules.USER).createUsers({ email: ADMIN.email });
  await container
    .resolve(Modules.AUTH)
    .updateAuthIdentities({ id: auth_identity_id, app_metadata: { user_id: user.id } });
  return { userId: user.id, authIdentityId: auth_identity_id as string };
}

async function registerClient(api: Api): Promise<string> {
  const { data } = await api.post('/oauth/register', { client_name: 'Flow test', redirect_uris: [REDIRECT_URI] });
  return data.client_id;
}

function authorizeUrl(clientId: string, challenge: string, extra: Record<string, string> = {}) {
  return `/oauth/authorize?${new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: 'state-123',
    resource: RESOURCE,
    ...extra,
  })}`;
}

async function post(api: Api, url: string, body: [string, string][] | Record<string, string>) {
  return api.post(url, new URLSearchParams(body).toString(), { ...noFollow, headers: formHeaders });
}

/** Runs login and consent, returning the redirect the client would receive. */
async function authorize(api: Api, clientId: string, challenge: string, approve: string[] = ['mcp:read', 'mcp:write']) {
  const login = await api.get(authorizeUrl(clientId, challenge, { scope: 'mcp:read mcp:write' }), noFollow);
  const consent = await post(api, '/oauth/authorize/login', { request: hiddenField(login.data, 'request'), ...ADMIN });
  const grant = hiddenField(consent.data, 'grant');
  const redirect = await post(api, '/oauth/authorize/consent', [
    ['grant', grant],
    ['decision', 'approve'],
    ...approve.map((scope): [string, string] => ['scope', scope]),
  ]);
  return new URL(redirect.headers.location);
}

async function token(api: Api, body: Record<string, string>) {
  return post(api, '/oauth/token', body);
}

medusaIntegrationTestRunner({
  env: {},
  testSuite: ({ api, getContainer }) => {
    const oauth = () => getContainer().resolve<McpOAuthService>('mcp_oauth');
    let admin: { userId: string; authIdentityId: string };

    beforeEach(async () => {
      admin = await createAdmin(api, getContainer());
    });

    describe('authorize', () => {
      it('shows the login form, rejects a wrong password, and shows consent after a correct one', async () => {
        const clientId = await registerClient(api);
        const login = await api.get(authorizeUrl(clientId, pkce().challenge), noFollow);
        expect(login.status).toBe(200);
        expect(login.headers['x-frame-options']).toBe('DENY');
        expect(login.data).toContain('action="/oauth/authorize/login"');
        expect(login.data).toContain('localhost:6274');

        const request = hiddenField(login.data, 'request');
        const wrong = await post(api, '/oauth/authorize/login', { request, email: ADMIN.email, password: 'nope' });
        expect(wrong.status).toBe(401);
        expect(wrong.data).toContain('did not match an admin account');

        const consent = await post(api, '/oauth/authorize/login', { request, ...ADMIN });
        expect(consent.status).toBe(200);
        expect(consent.data).toContain('Allow access?');
        expect([...consent.data.matchAll(/value="(mcp:[a-z]+)"/g)].map((match) => match[1])).toEqual([
          'mcp:read',
          'mcp:write',
          'mcp:delete',
        ]);
      });

      it('skips the login form for an admin with a Medusa session', async () => {
        const clientId = await registerClient(api);
        const { data } = await api.post('/auth/user/emailpass', ADMIN);
        const session = await api.post('/auth/session', {}, { headers: { authorization: `Bearer ${data.token}` } });
        const cookie = String(session.headers['set-cookie']).split(';')[0];

        const page = await api.get(authorizeUrl(clientId, pkce().challenge), { ...noFollow, headers: { cookie } });
        expect(page.data).toContain('Allow access?');
        expect(page.data).not.toContain('action="/oauth/authorize/login"');
      });

      it('never redirects to an unregistered redirect URI, and redirects other errors back with state and iss', async () => {
        const clientId = await registerClient(api);
        const evil = await api.get(
          authorizeUrl(clientId, pkce().challenge, { redirect_uri: 'https://evil.example/cb' }),
          noFollow,
        );
        expect(evil.status).toBe(400);
        expect(evil.headers.location).toBeUndefined();

        const badScope = await api.get(authorizeUrl(clientId, pkce().challenge, { scope: 'mcp:admin' }), noFollow);
        const location = new URL(badScope.headers.location);
        expect(badScope.status).toBe(302);
        expect(Object.fromEntries(location.searchParams)).toMatchObject({
          error: 'invalid_scope',
          state: 'state-123',
          iss: ISSUER,
        });

        const badResource = await api.get(
          authorizeUrl(clientId, pkce().challenge, { resource: 'https://other.example/mcp' }),
          noFollow,
        );
        expect(new URL(badResource.headers.location).searchParams.get('error')).toBe('invalid_target');
      });

      it('redirects with access_denied when the admin denies, and rejects a forged form', async () => {
        const clientId = await registerClient(api);
        const login = await api.get(authorizeUrl(clientId, pkce().challenge), noFollow);
        const consent = await post(api, '/oauth/authorize/login', {
          request: hiddenField(login.data, 'request'),
          ...ADMIN,
        });
        const denied = await post(api, '/oauth/authorize/consent', {
          grant: hiddenField(consent.data, 'grant'),
          decision: 'deny',
        });
        expect(new URL(denied.headers.location).searchParams.get('error')).toBe('access_denied');

        const grant = hiddenField(consent.data, 'grant');
        const [body, signature] = grant.split('.');
        const tampered = Buffer.from(
          Buffer.from(body, 'base64url').toString('utf8').replace(admin.userId, 'user_attacker'),
        ).toString('base64url');
        const forged = await post(api, '/oauth/authorize/consent', {
          grant: `${tampered}.${signature}`,
          decision: 'approve',
          scope: 'mcp:read',
        });
        expect(forged.status).toBe(400);
        expect(forged.data).toContain('expired or was changed');
      });
    });

    describe('token', () => {
      it('exchanges a code for tokens limited to the approved scopes and bound to the MCP resource', async () => {
        const clientId = await registerClient(api);
        const { verifier, challenge } = pkce();
        const callback = await authorize(api, clientId, challenge, ['mcp:read']);
        expect(callback.searchParams.get('state')).toBe('state-123');
        expect(callback.searchParams.get('iss')).toBe(ISSUER);

        const response = await token(api, {
          grant_type: 'authorization_code',
          code: callback.searchParams.get('code') as string,
          client_id: clientId,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
          resource: RESOURCE,
        });
        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe('no-store');
        expect(response.data).toMatchObject({ token_type: 'Bearer', expires_in: 3600, scope: 'mcp:read' });

        expect(await oauth().verifyAccessToken(response.data.access_token, RESOURCE)).toMatchObject({
          user_id: admin.userId,
          auth_identity_id: admin.authIdentityId,
          client_id: clientId,
          scopes: ['mcp:read'],
        });
        expect(
          await oauth().verifyAccessToken(response.data.access_token, 'https://other.example/mcp'),
        ).toBeUndefined();
        expect(await oauth().verifyAccessToken('mcp_at_unknown', RESOURCE)).toBeUndefined();
      });

      it('rejects a wrong verifier, a different redirect_uri, or a different client', async () => {
        const clientId = await registerClient(api);
        const { verifier, challenge } = pkce();
        const code = (await authorize(api, clientId, challenge)).searchParams.get('code') as string;
        const exchange = { grant_type: 'authorization_code', code, client_id: clientId, redirect_uri: REDIRECT_URI };

        const wrongVerifier = await token(api, { ...exchange, code_verifier: pkce().verifier });
        expect(wrongVerifier.data).toEqual({ error: 'invalid_grant', error_description: 'PKCE verification failed' });
        expect(
          (await token(api, { ...exchange, code_verifier: verifier, redirect_uri: 'http://localhost:1/x' })).data.error,
        ).toBe('invalid_grant');
        expect(
          (await token(api, { ...exchange, code_verifier: verifier, client_id: await registerClient(api) })).data.error,
        ).toBe('invalid_grant');
        expect((await token(api, { ...exchange, code_verifier: verifier })).status).toBe(200);
      });

      it('revokes the tokens issued from a code when that code is replayed', async () => {
        const clientId = await registerClient(api);
        const { verifier, challenge } = pkce();
        const code = (await authorize(api, clientId, challenge)).searchParams.get('code') as string;
        const exchange = {
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        };

        const first = await token(api, exchange);
        const replay = await token(api, exchange);
        expect(replay.status).toBe(400);
        expect(replay.data.error).toBe('invalid_grant');
        expect(await oauth().verifyAccessToken(first.data.access_token, RESOURCE)).toBeUndefined();
      });

      it('rotates refresh tokens, can only narrow scopes, and revokes the family when an old one is reused', async () => {
        const clientId = await registerClient(api);
        const { verifier, challenge } = pkce();
        const code = (await authorize(api, clientId, challenge)).searchParams.get('code') as string;
        const first = await token(api, {
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        });

        const widened = await token(api, {
          grant_type: 'refresh_token',
          refresh_token: first.data.refresh_token,
          client_id: clientId,
          scope: 'mcp:read mcp:delete',
        });
        expect(widened.data.error).toBe('invalid_scope');

        const second = await token(api, {
          grant_type: 'refresh_token',
          refresh_token: first.data.refresh_token,
          client_id: clientId,
          scope: 'mcp:read',
        });
        expect(second.status).toBe(200);
        expect(second.data.scope).toBe('mcp:read');
        expect(second.data.refresh_token).not.toBe(first.data.refresh_token);

        const reuse = await token(api, {
          grant_type: 'refresh_token',
          refresh_token: first.data.refresh_token,
          client_id: clientId,
        });
        expect(reuse.data.error).toBe('invalid_grant');
        expect(await oauth().verifyAccessToken(second.data.access_token, RESOURCE)).toBeUndefined();
        const afterTheft = await token(api, {
          grant_type: 'refresh_token',
          refresh_token: second.data.refresh_token,
          client_id: clientId,
        });
        expect(afterTheft.data.error).toBe('invalid_grant');
      });

      it('rejects unsupported grant types', async () => {
        const response = await token(api, { grant_type: 'password', username: ADMIN.email, password: ADMIN.password });
        expect(response.status).toBe(400);
        expect(response.data.error).toBe('unsupported_grant_type');
      });
    });
  },
});

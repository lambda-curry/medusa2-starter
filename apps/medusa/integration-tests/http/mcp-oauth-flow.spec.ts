import type McpOAuthService from '@lambdacurry/medusa-mcp/modules/mcp_oauth/service';
import { medusaIntegrationTestRunner } from '@medusajs/test-utils';
import {
  ADMIN,
  authorize,
  authorizeUrl,
  createAdmin,
  hiddenField,
  ISSUER,
  noFollow,
  pkce,
  post,
  REDIRECT_URI,
  RESOURCE,
  registerClient,
  token,
} from './helpers/oauth';

jest.setTimeout(60 * 1000);

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

import { createHash, randomBytes } from 'node:crypto';
import type { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export const ISSUER = 'http://localhost:9000';
export const RESOURCE = `${ISSUER}/mcp`;
export const REDIRECT_URI = 'http://localhost:6274/oauth/callback';
export const ADMIN = { email: 'mcp-admin@example.com', password: 'correct horse battery staple' };

// biome-ignore lint/suspicious/noExplicitAny: the test runner's axios instance is untyped.
export type Api = any;
export const noFollow = { maxRedirects: 0, validateStatus: () => true };
export const formHeaders = { 'content-type': 'application/x-www-form-urlencoded' };

export function hiddenField(html: string, name: string): string {
  const value = html.match(new RegExp(`name="${name}" value="([^"]+)"`))?.[1];
  if (!value) throw new Error(`No hidden ${name} field in:\n${html.slice(0, 500)}`);
  return value.replaceAll('&quot;', '"').replaceAll('&amp;', '&');
}

export function pkce() {
  const verifier = randomBytes(32).toString('base64url');
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url') };
}

export async function createAdmin(api: Api, container: MedusaContainer) {
  const { data } = await api.post('/auth/user/emailpass/register', ADMIN);
  const { auth_identity_id } = JSON.parse(Buffer.from(data.token.split('.')[1], 'base64url').toString('utf8'));
  const user = await container.resolve(Modules.USER).createUsers({ email: ADMIN.email });
  await container
    .resolve(Modules.AUTH)
    .updateAuthIdentities({ id: auth_identity_id, app_metadata: { user_id: user.id } });
  return { userId: user.id, authIdentityId: auth_identity_id as string };
}

export async function registerClient(api: Api): Promise<string> {
  const { data } = await api.post('/oauth/register', { client_name: 'Flow test', redirect_uris: [REDIRECT_URI] });
  return data.client_id;
}

export function authorizeUrl(clientId: string, challenge: string, extra: Record<string, string> = {}) {
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

export async function post(api: Api, url: string, body: [string, string][] | Record<string, string>) {
  return api.post(url, new URLSearchParams(body).toString(), { ...noFollow, headers: formHeaders });
}

/** Runs login and consent, returning the redirect the client would receive. */
export async function authorize(
  api: Api,
  clientId: string,
  challenge: string,
  approve: string[] = ['mcp:read', 'mcp:write'],
) {
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

export async function token(api: Api, body: Record<string, string>) {
  return post(api, '/oauth/token', body);
}

/** Runs the whole OAuth flow for the given scopes and returns the token response. */
export async function issueAccessToken(api: Api, scopes: string[] = ['mcp:read', 'mcp:write', 'mcp:delete']) {
  const clientId = await registerClient(api);
  const { verifier, challenge } = pkce();
  const login = await api.get(authorizeUrl(clientId, challenge, { scope: scopes.join(' ') }), noFollow);
  const consent = await post(api, '/oauth/authorize/login', { request: hiddenField(login.data, 'request'), ...ADMIN });
  const redirect = await post(api, '/oauth/authorize/consent', [
    ['grant', hiddenField(consent.data, 'grant')],
    ['decision', 'approve'],
    ...scopes.map((scope): [string, string] => ['scope', scope]),
  ]);
  const response = await token(api, {
    grant_type: 'authorization_code',
    code: new URL(redirect.headers.location).searchParams.get('code') as string,
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier,
  });
  return response.data as { access_token: string; refresh_token: string; scope: string };
}

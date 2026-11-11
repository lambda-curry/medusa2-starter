import { randomBytes } from 'node:crypto';
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { MCP_OAUTH_MODULE } from '../modules/mcp_oauth';
import { OAuthError, RedirectableOAuthError } from '../modules/mcp_oauth/errors';
import type McpOAuthService from '../modules/mcp_oauth/service';
import { errorPage, sendPage } from './oauth-pages';

/** How long a login or consent form stays valid. */
export const AUTHORIZE_FORM_TTL_SECONDS = 10 * 60;

export function oauthService(req: MedusaRequest): McpOAuthService {
  return req.scope.resolve<McpOAuthService>(MCP_OAUTH_MODULE);
}

/**
 * Signs authorize form state with a random key made when this process starts. Form state only has to survive the
 * few minutes between showing a page and its submission, so it needs no shared secret. Keying it to Medusa's cookie
 * or JWT secret instead would let anyone who knows a default secret forge a consent grant. A Medusa restart expires
 * open sign-in and consent pages; the user starts the connection again.
 */
const FORM_SIGNING_KEY = randomBytes(32).toString('base64url');

export function formSecret(_req: MedusaRequest): string {
  return FORM_SIGNING_KEY;
}

/** Redirects back to the client with an authorization response, always naming the issuer (RFC 9207). */
export function redirectToClient(
  res: MedusaResponse,
  issuer: string,
  redirectUri: string,
  params: Record<string, string | undefined>,
): void {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries({ ...params, iss: issuer })) {
    if (value !== undefined) url.searchParams.set(key, value);
  }
  res.set('Cache-Control', 'no-store').redirect(302, url.toString());
}

/** Reports an authorize-endpoint error: by redirect once the redirect URI is trusted, otherwise on a page. */
export function sendAuthorizeError(res: MedusaResponse, issuer: string, error: unknown): void {
  if (error instanceof RedirectableOAuthError) {
    redirectToClient(res, issuer, error.redirectUri, {
      error: error.code,
      error_description: error.message,
      state: error.state,
    });
    return;
  }
  if (error instanceof OAuthError) {
    sendPage(res, error.status, errorPage(error.message));
    return;
  }
  throw error;
}

/** Sends an OAuthError as `{ error, error_description }`; rethrows anything else for Medusa's error handler. */
export function sendOAuthError(res: MedusaResponse, error: unknown): void {
  if (!(error instanceof OAuthError)) throw error;
  res.status(error.status).set('Cache-Control', 'no-store').json(error.toJSON());
}

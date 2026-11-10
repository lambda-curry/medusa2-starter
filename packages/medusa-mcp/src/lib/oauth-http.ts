import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { MCP_OAUTH_MODULE } from '../modules/mcp_oauth';
import { OAuthError } from '../modules/mcp_oauth/errors';
import type McpOAuthService from '../modules/mcp_oauth/service';

export function oauthService(req: MedusaRequest): McpOAuthService {
  return req.scope.resolve<McpOAuthService>(MCP_OAUTH_MODULE);
}

/** Sends an OAuthError as `{ error, error_description }`; rethrows anything else for Medusa's error handler. */
export function sendOAuthError(res: MedusaResponse, error: unknown): void {
  if (!(error instanceof OAuthError)) throw error;
  res.status(error.status).set('Cache-Control', 'no-store').json(error.toJSON());
}

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { oauthService, sendOAuthError } from '../../../lib/oauth-http';
import { OAuthError } from '../../../modules/mcp_oauth/errors';

/** The token endpoint for public clients: the `authorization_code` and `refresh_token` grants. */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const params = (req.body ?? {}) as Record<string, unknown>;
  const service = oauthService(req);
  try {
    const tokens =
      params.grant_type === 'authorization_code'
        ? await service.exchangeAuthorizationCode(params)
        : params.grant_type === 'refresh_token'
          ? await service.refreshAccessToken(params)
          : (() => {
              throw new OAuthError('unsupported_grant_type', 'grant_type must be authorization_code or refresh_token');
            })();
    res.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache' }).json(tokens);
  } catch (error) {
    sendOAuthError(res, error);
  }
};

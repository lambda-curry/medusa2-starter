import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { AUTHORIZE_FORM_TTL_SECONDS, formSecret, oauthService, sendAuthorizeError } from '../../../lib/oauth-http';
import { consentPage, loginPage, sendPage } from '../../../lib/oauth-pages';
import { signPayload } from '../../../modules/mcp_oauth/crypto';
import type { AuthorizationRequest } from '../../../modules/mcp_oauth/service';

/**
 * Starts an authorization. An admin already signed in to Medusa (by session cookie) goes straight to consent;
 * anyone else signs in with their Medusa admin email and password first.
 */
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const service = oauthService(req);
  let request: AuthorizationRequest;
  try {
    request = await service.parseAuthorizationRequest(req.query as Record<string, unknown>);
  } catch (error) {
    sendAuthorizeError(res, service.config.issuer, error);
    return;
  }

  const secret = formSecret(req);
  const auth = req.auth_context;
  if (auth?.actor_type === 'user' && auth.actor_id && auth.auth_identity_id) {
    const grant = signPayload(
      'consent',
      { request, user_id: auth.actor_id, auth_identity_id: auth.auth_identity_id },
      secret,
      AUTHORIZE_FORM_TTL_SECONDS,
    );
    sendPage(
      res,
      200,
      consentPage({
        clientName: request.client_name,
        redirectUri: request.redirect_uri,
        scopes: request.scopes,
        grant,
      }),
      [request.redirect_uri],
    );
    return;
  }

  sendPage(
    res,
    200,
    loginPage({
      clientName: request.client_name,
      redirectUri: request.redirect_uri,
      request: signPayload('login', { request }, secret, AUTHORIZE_FORM_TTL_SECONDS),
    }),
  );
};

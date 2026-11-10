import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { formSecret, oauthService, redirectToClient } from '../../../../lib/oauth-http';
import { errorPage, sendPage } from '../../../../lib/oauth-pages';
import type { McpScope } from '../../../../modules/mcp_oauth/config';
import { verifyPayload } from '../../../../modules/mcp_oauth/crypto';
import type { AuthorizationRequest, AuthorizingUser } from '../../../../modules/mcp_oauth/service';

/** Records the admin's decision. Approving issues a single-use code for the scopes they left checked. */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const grant = verifyPayload<{ request: AuthorizationRequest } & AuthorizingUser>(body.grant, formSecret(req));
  if (!grant) {
    sendPage(
      res,
      400,
      errorPage('This approval form expired or was changed. Start the connection again from your app.'),
    );
    return;
  }

  const service = oauthService(req);
  const { request } = grant;
  const checked = new Set([body.scope].flat().filter((scope): scope is string => typeof scope === 'string'));
  const scopes = request.scopes.filter((scope): scope is McpScope => checked.has(scope));

  if (body.decision !== 'approve' || !scopes.length) {
    redirectToClient(res, service.config.issuer, request.redirect_uri, {
      error: 'access_denied',
      error_description: body.decision === 'approve' ? 'No permissions were granted' : 'The admin denied access',
      state: request.state,
    });
    return;
  }

  const code = await service.issueAuthorizationCode(
    request,
    { user_id: grant.user_id, auth_identity_id: grant.auth_identity_id },
    scopes,
  );
  redirectToClient(res, service.config.issuer, request.redirect_uri, { code, state: request.state });
};

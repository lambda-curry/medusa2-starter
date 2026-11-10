import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { IAuthModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { AUTHORIZE_FORM_TTL_SECONDS, formSecret } from '../../../../lib/oauth-http';
import { consentPage, errorPage, loginPage, sendPage } from '../../../../lib/oauth-pages';
import { signPayload, verifyPayload } from '../../../../modules/mcp_oauth/crypto';
import type { AuthorizationRequest } from '../../../../modules/mcp_oauth/service';

const EXPIRED = 'This sign-in form expired or was changed. Start the connection again from your app.';

/** Signs in with a Medusa admin email and password through Medusa's own auth module, then shows consent. */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const secret = formSecret(req);
  const signed = verifyPayload<{ request: AuthorizationRequest }>(body.request, secret);
  if (!signed) {
    sendPage(res, 400, errorPage(EXPIRED));
    return;
  }
  const { request } = signed;
  const retry = (status: number, error: string) =>
    sendPage(
      res,
      status,
      loginPage({
        clientName: request.client_name,
        redirectUri: request.redirect_uri,
        request: String(body.request),
        error,
      }),
    );

  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    retry(400, 'Enter your admin email and password.');
    return;
  }

  const auth = req.scope.resolve<IAuthModuleService>(Modules.AUTH);
  const { success, authIdentity, mfaChallenge } = await auth.authenticate('emailpass', {
    url: req.url,
    headers: req.headers as Record<string, string>,
    query: {},
    body: { email: body.email, password: body.password },
    protocol: req.protocol,
  });

  const userId = authIdentity?.app_metadata?.user_id;
  if (!success || !authIdentity || typeof userId !== 'string') {
    retry(401, 'That email and password did not match an admin account.');
    return;
  }
  if (mfaChallenge) {
    retry(
      403,
      'This account uses two-factor authentication. Sign in to the Medusa admin in this browser first, then start the connection again.',
    );
    return;
  }

  const grant = signPayload(
    { request, user_id: userId, auth_identity_id: authIdentity.id },
    secret,
    AUTHORIZE_FORM_TTL_SECONDS,
  );
  sendPage(
    res,
    200,
    consentPage({ clientName: request.client_name, redirectUri: request.redirect_uri, scopes: request.scopes, grant }),
  );
};

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { oauthService, sendOAuthError } from '../../../lib/oauth-http';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const client = await oauthService(req).registerDynamicClient(req.body);
    res.status(201).set('Cache-Control', 'no-store').json(client);
  } catch (error) {
    sendOAuthError(res, error);
  }
};

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { oauthService } from '../../../lib/oauth-http';
import { authorizationServerMetadata } from '../../../modules/mcp_oauth/config';

export const GET = (req: MedusaRequest, res: MedusaResponse) => {
  res.json(authorizationServerMetadata(oauthService(req).config));
};

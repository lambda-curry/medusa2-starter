import { model } from '@medusajs/framework/utils';

/** A single-use authorization code, bound to the PKCE challenge, redirect URI, and resource it was issued for. */
export const McpOAuthAuthorization = model.define('mcp_oauth_authorization', {
  id: model.id({ prefix: 'mcpaz' }).primaryKey(),
  code_hash: model.text().unique(),
  client_id: model.text(),
  user_id: model.text(),
  auth_identity_id: model.text(),
  scopes: model.array(),
  resource: model.text(),
  redirect_uri: model.text(),
  code_challenge: model.text(),
  expires_at: model.dateTime(),
});

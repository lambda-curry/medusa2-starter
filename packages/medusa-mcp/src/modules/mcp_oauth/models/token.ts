import { model } from '@medusajs/framework/utils';

/**
 * An access token and its refresh token. `authorization_id` and `parent_token_id` are unique, so a code can be
 * exchanged once and a refresh token rotated once, even under concurrent requests.
 */
export const McpOAuthToken = model
  .define('mcp_oauth_token', {
    id: model.id({ prefix: 'mcptk' }).primaryKey(),
    family_id: model.text(),
    authorization_id: model.text().unique().nullable(),
    parent_token_id: model.text().unique().nullable(),
    client_id: model.text(),
    user_id: model.text(),
    auth_identity_id: model.text(),
    scopes: model.array(),
    resource: model.text(),
    access_token_hash: model.text().unique(),
    access_expires_at: model.dateTime(),
    refresh_token_hash: model.text().unique(),
    refresh_expires_at: model.dateTime(),
    rotated_at: model.dateTime().nullable(),
    revoked_at: model.dateTime().nullable(),
  })
  .indexes([{ on: ['family_id'] }]);

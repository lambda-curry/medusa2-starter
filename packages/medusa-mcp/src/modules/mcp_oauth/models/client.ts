import { model } from '@medusajs/framework/utils';

/** An OAuth client, registered by Client ID Metadata Document (`cimd`) or Dynamic Client Registration (`dcr`). */
export const McpOAuthClient = model.define('mcp_oauth_client', {
  id: model.id({ prefix: 'mcpcl' }).primaryKey(),
  client_id: model.text().unique(),
  registration: model.enum(['cimd', 'dcr']),
  client_name: model.text(),
  redirect_uris: model.array(),
  metadata: model.json(),
  metadata_fetched_at: model.dateTime().nullable(),
});

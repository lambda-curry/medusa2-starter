export type MedusaMcpPluginOptions = {
  /** Public origin of this Medusa server, used as the OAuth issuer and the MCP resource URL base. */
  issuer?: string;
  /** Extra `METHOD /path` operation keys to block, added to the plugin's built-in blocklist. */
  blockedOperations?: string[];
};

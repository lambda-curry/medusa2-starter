import type { MedusaMcpPluginOptions } from '../../types';

export const MCP_SCOPES = ['mcp:read', 'mcp:write', 'mcp:delete'] as const;

export type McpScope = (typeof MCP_SCOPES)[number];

export interface McpOAuthConfig {
  /** OAuth issuer and public origin, without a trailing slash. */
  issuer: string;
  /** The MCP endpoint's canonical URI, which tokens are issued for. */
  resource: string;
  authorizationCodeTtlSeconds: number;
  accessTokenTtlSeconds: number;
  refreshTokenTtlSeconds: number;
}

const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function isLoopbackHost(hostname: string): boolean {
  return LOOPBACK_HOSTS.has(hostname);
}

export function resolveOAuthConfig(options: MedusaMcpPluginOptions = {}): McpOAuthConfig {
  const issuer = (options.issuer || 'http://localhost:9000').replace(/\/+$/, '');
  const url = new URL(issuer);
  if (url.pathname !== '/' || url.search || url.hash) {
    throw new Error(`medusa-mcp issuer must be an origin with no path, query, or fragment: ${issuer}`);
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopbackHost(url.hostname))) {
    throw new Error(`medusa-mcp issuer must use https outside localhost: ${issuer}`);
  }

  return {
    issuer,
    resource: `${issuer}/mcp`,
    authorizationCodeTtlSeconds: 600,
    accessTokenTtlSeconds: 3600,
    refreshTokenTtlSeconds: 30 * 24 * 3600,
  };
}

/** RFC 8414 authorization server metadata. */
export function authorizationServerMetadata(config: McpOAuthConfig) {
  return {
    issuer: config.issuer,
    authorization_endpoint: `${config.issuer}/oauth/authorize`,
    token_endpoint: `${config.issuer}/oauth/token`,
    registration_endpoint: `${config.issuer}/oauth/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [...MCP_SCOPES],
    client_id_metadata_document_supported: true,
    authorization_response_iss_parameter_supported: true,
  };
}

/** RFC 9728 protected resource metadata for the MCP endpoint. */
export function protectedResourceMetadata(config: McpOAuthConfig) {
  return {
    resource: config.resource,
    authorization_servers: [config.issuer],
    scopes_supported: [...MCP_SCOPES],
    bearer_methods_supported: ['header'],
    resource_name: 'Medusa MCP',
  };
}

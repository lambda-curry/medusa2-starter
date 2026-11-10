import { randomBytes } from 'node:crypto';
import { MedusaService } from '@medusajs/framework/utils';
import type { MedusaMcpPluginOptions } from '../../types';
import { cimdClientIdProblem, type FetchJson, fetchPublicJson, validateClientMetadataDocument } from './cimd';
import { MCP_SCOPES, type McpOAuthConfig, type McpScope, resolveOAuthConfig } from './config';
import { isValidCodeVerifier, sha256Hex, verifyPkceS256 } from './crypto';
import { OAuthError, RedirectableOAuthError } from './errors';
import { McpOAuthAuthorization } from './models/authorization';
import { McpOAuthClient } from './models/client';
import { McpOAuthToken } from './models/token';
import { redirectUrisProblems } from './redirect-uri';

const CIMD_CACHE_MS = 60 * 60 * 1000;
const SUPPORTED_GRANT_TYPES = ['authorization_code', 'refresh_token'];
const MAX_CLIENT_NAME_LENGTH = 200;

export interface ResolvedClient {
  client_id: string;
  registration: 'cimd' | 'dcr';
  client_name: string;
  redirect_uris: string[];
}

/** A validated authorization request, ready for the user to approve. */
export interface AuthorizationRequest {
  client_id: string;
  client_name: string;
  redirect_uri: string;
  scopes: McpScope[];
  state?: string;
  code_challenge: string;
  resource: string;
}

/** Who approved an authorization: the Medusa admin user and their auth identity. */
export interface AuthorizingUser {
  user_id: string;
  auth_identity_id: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/** What an access token grants, as the MCP endpoint sees it. */
export interface VerifiedAccessToken extends AuthorizingUser {
  token_id: string;
  client_id: string;
  scopes: McpScope[];
  resource: string;
  expires_at: Date;
}

const CODE_CHALLENGE = /^[A-Za-z0-9\-_]{43,128}$/;

/** Parses a space-delimited scope string into known MCP scopes; no scope means every scope. */
export function parseScopes(scope: unknown): McpScope[] | undefined {
  if (scope === undefined || scope === '') return [...MCP_SCOPES];
  if (typeof scope !== 'string') return undefined;
  const requested = [...new Set(scope.split(' ').filter(Boolean))];
  if (!requested.every((item): item is McpScope => (MCP_SCOPES as readonly string[]).includes(item))) return undefined;
  return MCP_SCOPES.filter((item) => requested.includes(item));
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value ? value : undefined;
}

export function randomToken(prefix: string): string {
  return `${prefix}${randomBytes(32).toString('base64url')}`;
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : undefined;
}

export default class McpOAuthService extends MedusaService({
  McpOAuthClient,
  McpOAuthAuthorization,
  McpOAuthToken,
}) {
  readonly config: McpOAuthConfig;
  protected fetchJson: FetchJson = fetchPublicJson;

  constructor(container: Record<string, unknown>, options?: MedusaMcpPluginOptions) {
    super(container, options);
    this.config = resolveOAuthConfig(options);
  }

  /** Test seam for Client ID Metadata Document fetches. */
  async setFetchJson(fetchJson: FetchJson): Promise<void> {
    this.fetchJson = fetchJson;
  }

  /**
   * Finds the client for a client_id. A URL client_id is a Client ID Metadata Document, fetched (and cached for
   * an hour) from that URL. Any other client_id must have been registered through Dynamic Client Registration.
   */
  async resolveClient(clientId: unknown): Promise<ResolvedClient> {
    if (typeof clientId !== 'string' || !clientId) throw new OAuthError('invalid_request', 'client_id is required');
    const [existing] = await this.listMcpOAuthClients({ client_id: clientId });

    if (!clientId.startsWith('https://')) {
      if (!existing || existing.registration !== 'dcr') throw new OAuthError('invalid_client', 'Unknown client_id');
      return existing as ResolvedClient;
    }

    const problem = cimdClientIdProblem(clientId);
    if (problem) throw new OAuthError('invalid_client', problem);
    if (
      existing?.metadata_fetched_at &&
      Date.now() - new Date(existing.metadata_fetched_at).getTime() < CIMD_CACHE_MS
    ) {
      return existing as ResolvedClient;
    }

    let document: ReturnType<typeof validateClientMetadataDocument>;
    try {
      document = validateClientMetadataDocument(clientId, await this.fetchJson(clientId));
    } catch (error) {
      throw new OAuthError('invalid_client', (error as Error).message);
    }

    const data = {
      client_id: clientId,
      registration: 'cimd' as const,
      client_name: document.client_name.slice(0, MAX_CLIENT_NAME_LENGTH),
      redirect_uris: document.redirect_uris,
      metadata: document,
      metadata_fetched_at: new Date(),
    };
    if (existing) return (await this.updateMcpOAuthClients({ id: existing.id, ...data })) as ResolvedClient;
    try {
      return (await this.createMcpOAuthClients(data)) as ResolvedClient;
    } catch (error) {
      // Another request created this client first; the unique client_id index rejected the duplicate.
      const [created] = await this.listMcpOAuthClients({ client_id: clientId });
      if (created) return created as ResolvedClient;
      throw error;
    }
  }

  /** RFC 7591 Dynamic Client Registration for public clients. */
  async registerDynamicClient(body: unknown) {
    const request = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;

    const redirectProblems = redirectUrisProblems(request.redirect_uris);
    if (redirectProblems.length) throw new OAuthError('invalid_redirect_uri', redirectProblems.join('; '));

    const problems: string[] = [];
    if (request.token_endpoint_auth_method !== undefined && request.token_endpoint_auth_method !== 'none') {
      problems.push('token_endpoint_auth_method must be "none"; this server only registers public clients');
    }
    const grantTypes = request.grant_types === undefined ? SUPPORTED_GRANT_TYPES : stringArray(request.grant_types);
    if (!grantTypes?.every((grant) => SUPPORTED_GRANT_TYPES.includes(grant))) {
      problems.push(`grant_types must be a subset of ${SUPPORTED_GRANT_TYPES.join(', ')}`);
    }
    const responseTypes = request.response_types === undefined ? ['code'] : stringArray(request.response_types);
    if (!responseTypes?.every((type) => type === 'code')) problems.push('response_types must be ["code"]');
    if (request.client_name !== undefined && typeof request.client_name !== 'string') {
      problems.push('client_name must be a string');
    }
    if (problems.length) throw new OAuthError('invalid_client_metadata', problems.join('; '));

    const clientName = ((request.client_name as string | undefined) || 'Unnamed MCP client').slice(
      0,
      MAX_CLIENT_NAME_LENGTH,
    );
    const metadata = {
      client_name: clientName,
      redirect_uris: request.redirect_uris as string[],
      token_endpoint_auth_method: 'none',
      grant_types: grantTypes,
      response_types: responseTypes,
    };
    const client = await this.createMcpOAuthClients({
      client_id: randomToken('mcpdcr_'),
      registration: 'dcr',
      client_name: clientName,
      redirect_uris: metadata.redirect_uris,
      metadata,
    });

    return {
      client_id: client.client_id,
      client_id_issued_at: Math.floor(new Date(client.created_at).getTime() / 1000),
      ...metadata,
    };
  }

  /**
   * Validates an authorization request. Problems found before the redirect URI is verified throw an
   * {@link OAuthError}, shown to the user. Problems after that throw a {@link RedirectableOAuthError}, sent back to
   * the client.
   */
  async parseAuthorizationRequest(params: Record<string, unknown>): Promise<AuthorizationRequest> {
    const client = await this.resolveClient(params.client_id);
    const redirectUri = optionalString(params.redirect_uri);
    if (!redirectUri) throw new OAuthError('invalid_request', 'redirect_uri is required');
    if (!client.redirect_uris.includes(redirectUri)) {
      throw new OAuthError('invalid_request', 'redirect_uri is not registered for this client');
    }

    const state = optionalString(params.state);
    const fail = (code: OAuthError['code'], message: string) =>
      new RedirectableOAuthError(code, message, redirectUri, state);

    if (params.response_type !== 'code') throw fail('unsupported_response_type', 'response_type must be "code"');
    if (params.code_challenge_method !== 'S256') throw fail('invalid_request', 'code_challenge_method must be "S256"');
    const codeChallenge = optionalString(params.code_challenge);
    if (!codeChallenge || !CODE_CHALLENGE.test(codeChallenge)) {
      throw fail('invalid_request', 'code_challenge must be a base64url S256 challenge');
    }
    const resource = optionalString(params.resource) ?? this.config.resource;
    if (resource !== this.config.resource) throw fail('invalid_target', `resource must be ${this.config.resource}`);
    const scopes = parseScopes(params.scope);
    if (!scopes) throw fail('invalid_scope', `scope must be a subset of: ${MCP_SCOPES.join(' ')}`);

    return {
      client_id: client.client_id,
      client_name: client.client_name,
      redirect_uri: redirectUri,
      scopes,
      state,
      code_challenge: codeChallenge,
      resource,
    };
  }

  /** Stores a single-use authorization code for an approved request and returns the code. */
  async issueAuthorizationCode(
    request: AuthorizationRequest,
    user: AuthorizingUser,
    scopes: McpScope[],
  ): Promise<string> {
    const code = randomToken('mcp_ac_');
    await this.createMcpOAuthAuthorizations({
      code_hash: sha256Hex(code),
      client_id: request.client_id,
      user_id: user.user_id,
      auth_identity_id: user.auth_identity_id,
      scopes,
      resource: request.resource,
      redirect_uri: request.redirect_uri,
      code_challenge: request.code_challenge,
      expires_at: new Date(Date.now() + this.config.authorizationCodeTtlSeconds * 1000),
    });
    return code;
  }

  /** The `authorization_code` grant. A code that was already exchanged revokes every token issued from it. */
  async exchangeAuthorizationCode(params: Record<string, unknown>): Promise<TokenResponse> {
    const code = optionalString(params.code);
    if (!code) throw new OAuthError('invalid_request', 'code is required');
    const [authorization] = await this.listMcpOAuthAuthorizations({ code_hash: sha256Hex(code) });
    if (!authorization) throw new OAuthError('invalid_grant', 'authorization code is invalid');
    if (new Date(authorization.expires_at).getTime() < Date.now()) {
      throw new OAuthError('invalid_grant', 'authorization code has expired');
    }
    if (authorization.client_id !== params.client_id) {
      throw new OAuthError('invalid_grant', 'authorization code was issued to a different client');
    }
    if (authorization.redirect_uri !== params.redirect_uri) {
      throw new OAuthError('invalid_grant', 'redirect_uri does not match the authorization request');
    }
    if (
      !isValidCodeVerifier(params.code_verifier) ||
      !verifyPkceS256(params.code_verifier, authorization.code_challenge)
    ) {
      throw new OAuthError('invalid_grant', 'PKCE verification failed');
    }
    if (params.resource !== undefined && params.resource !== authorization.resource) {
      throw new OAuthError('invalid_target', `resource must be ${authorization.resource}`);
    }

    const replayed = async () => {
      const issued = await this.listMcpOAuthTokens({ authorization_id: authorization.id });
      await Promise.all(
        [...new Set(issued.map((token) => token.family_id))].map((family) => this.revokeFamily(family)),
      );
      return new OAuthError('invalid_grant', 'authorization code was already used; tokens issued from it are revoked');
    };
    const [alreadyIssued] = await this.listMcpOAuthTokens({ authorization_id: authorization.id });
    if (alreadyIssued) throw await replayed();

    try {
      return await this.issueTokens({
        family_id: randomToken('mcpfam_'),
        authorization_id: authorization.id,
        parent_token_id: null,
        client_id: authorization.client_id,
        user_id: authorization.user_id,
        auth_identity_id: authorization.auth_identity_id,
        scopes: authorization.scopes as McpScope[],
        resource: authorization.resource,
      });
    } catch (error) {
      const [raced] = await this.listMcpOAuthTokens({ authorization_id: authorization.id });
      if (raced) throw await replayed();
      throw error;
    }
  }

  /**
   * The `refresh_token` grant with rotation. Presenting a refresh token that was already rotated is treated as
   * theft and revokes the whole token family.
   */
  async refreshAccessToken(params: Record<string, unknown>): Promise<TokenResponse> {
    const refreshToken = optionalString(params.refresh_token);
    if (!refreshToken) throw new OAuthError('invalid_request', 'refresh_token is required');
    const [token] = await this.listMcpOAuthTokens({ refresh_token_hash: sha256Hex(refreshToken) });
    if (!token || token.client_id !== params.client_id)
      throw new OAuthError('invalid_grant', 'refresh token is invalid');
    if (token.revoked_at) throw new OAuthError('invalid_grant', 'refresh token was revoked');

    const reused = async () => {
      await this.revokeFamily(token.family_id);
      return new OAuthError('invalid_grant', 'refresh token was already used; every token from this grant is revoked');
    };
    if (token.rotated_at) throw await reused();
    if (new Date(token.refresh_expires_at).getTime() < Date.now()) {
      throw new OAuthError('invalid_grant', 'refresh token has expired');
    }
    if (params.resource !== undefined && params.resource !== token.resource) {
      throw new OAuthError('invalid_target', `resource must be ${token.resource}`);
    }

    const granted = token.scopes as McpScope[];
    const requested = params.scope === undefined ? granted : parseScopes(params.scope);
    if (!requested?.every((scope) => granted.includes(scope))) {
      throw new OAuthError('invalid_scope', 'a refreshed token cannot gain scopes the original grant did not have');
    }

    let response: TokenResponse;
    try {
      response = await this.issueTokens({
        family_id: token.family_id,
        authorization_id: null,
        parent_token_id: token.id,
        client_id: token.client_id,
        user_id: token.user_id,
        auth_identity_id: token.auth_identity_id,
        scopes: requested,
        resource: token.resource,
      });
    } catch (error) {
      const [raced] = await this.listMcpOAuthTokens({ parent_token_id: token.id });
      if (raced) throw await reused();
      throw error;
    }
    await this.updateMcpOAuthTokens({ id: token.id, rotated_at: new Date() });
    return response;
  }

  /** Looks up a live access token for the given resource; undefined when unknown, expired, or revoked. */
  async verifyAccessToken(accessToken: string, resource: string): Promise<VerifiedAccessToken | undefined> {
    if (!accessToken.startsWith('mcp_at_')) return undefined;
    const [token] = await this.listMcpOAuthTokens({ access_token_hash: sha256Hex(accessToken) });
    if (!token || token.revoked_at || token.resource !== resource) return undefined;
    const expiresAt = new Date(token.access_expires_at);
    if (expiresAt.getTime() < Date.now()) return undefined;
    return {
      token_id: token.id,
      user_id: token.user_id,
      auth_identity_id: token.auth_identity_id,
      client_id: token.client_id,
      scopes: token.scopes as McpScope[],
      resource: token.resource,
      expires_at: expiresAt,
    };
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.updateMcpOAuthTokens({
      selector: { family_id: familyId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  protected async issueTokens(grant: {
    family_id: string;
    authorization_id: string | null;
    parent_token_id: string | null;
    client_id: string;
    user_id: string;
    auth_identity_id: string;
    scopes: McpScope[];
    resource: string;
  }): Promise<TokenResponse> {
    const accessToken = randomToken('mcp_at_');
    const refreshToken = randomToken('mcp_rt_');
    const now = Date.now();
    await this.createMcpOAuthTokens({
      ...grant,
      access_token_hash: sha256Hex(accessToken),
      access_expires_at: new Date(now + this.config.accessTokenTtlSeconds * 1000),
      refresh_token_hash: sha256Hex(refreshToken),
      refresh_expires_at: new Date(now + this.config.refreshTokenTtlSeconds * 1000),
    });
    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this.config.accessTokenTtlSeconds,
      refresh_token: refreshToken,
      scope: grant.scopes.join(' '),
    };
  }
}

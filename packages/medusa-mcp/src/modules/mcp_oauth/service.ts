import { randomBytes } from 'node:crypto';
import { MedusaService } from '@medusajs/framework/utils';
import type { MedusaMcpPluginOptions } from '../../types';
import { cimdClientIdProblem, type FetchJson, fetchPublicJson, validateClientMetadataDocument } from './cimd';
import { type McpOAuthConfig, resolveOAuthConfig } from './config';
import { OAuthError } from './errors';
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
  setFetchJson(fetchJson: FetchJson): void {
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
    const saved = existing
      ? await this.updateMcpOAuthClients({ id: existing.id, ...data })
      : await this.createMcpOAuthClients(data);
    return saved as ResolvedClient;
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
}

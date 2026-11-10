import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { IApiKeyModuleService, IAuthModuleService } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { type AuthInfo, createMcpHandler } from '@modelcontextprotocol/server';
import { oauthService } from '../../lib/oauth-http';
import type { ExecutionTarget } from '../../mcp/execute';
import { getApiRegistry } from '../../mcp/registry';
import { buildMcpServer } from '../../mcp/server';
import type { VerifiedAccessToken } from '../../modules/mcp_oauth/service';

const ADMIN_TOKEN_TTL = '5m';

/** This server's own origin as the incoming request reached it, for loopback API calls. */
function localBaseUrl(req: MedusaRequest): string {
  let host = req.socket.localAddress ?? '127.0.0.1';
  if (host.startsWith('::ffff:')) host = host.slice('::ffff:'.length);
  if (host.includes(':')) host = `[${host}]`;
  return `http://${host}:${req.socket.localPort}`;
}

function executionTarget(
  req: MedusaRequest,
  authIdentity: Parameters<typeof generateAdminJwt>[1],
  verified: VerifiedAccessToken,
  revision: string,
): ExecutionTarget {
  let adminToken: Promise<string> | undefined;
  let publishableKey: Promise<string | undefined> | undefined;
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);
  return {
    tokenId: verified.token_id,
    audit: async (entry) => {
      logger.info(
        `[medusa-mcp] ${JSON.stringify({ ...entry, user_id: verified.user_id, client_id: verified.client_id, spec_revision: revision.slice(0, 12) })}`,
      );
    },
    baseUrl: localBaseUrl(req),
    adminToken: () => (adminToken ??= generateAdminJwt(req, authIdentity)),
    publishableKey: () =>
      (publishableKey ??= req.scope
        .resolve<IApiKeyModuleService>(Modules.API_KEY)
        .listApiKeys({ type: 'publishable' }, { order: { created_at: 'ASC' } })
        .then((keys) => keys.find((key) => !key.revoked_at)?.token)),
  };
}

/** Mints a short-lived Medusa admin JWT with Medusa's own helper, so roles and MFA claims match its login. */
async function generateAdminJwt(
  req: MedusaRequest,
  authIdentity: Awaited<ReturnType<IAuthModuleService['retrieveAuthIdentity']>>,
): Promise<string> {
  const { http } = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE).projectConfig;
  const { generateJwtTokenForAuthIdentity } = require(
    require.resolve('@medusajs/medusa/api/auth/utils/generate-jwt-token', { paths: [process.cwd()] }),
  ) as typeof import('@medusajs/medusa/api/auth/utils/generate-jwt-token');
  return generateJwtTokenForAuthIdentity(
    {
      authIdentity,
      actorType: 'user',
      authProvider: authIdentity.provider_identities?.[0]?.provider ?? 'emailpass',
      container: req.scope,
    },
    { secret: http.jwtSecret as string, expiresIn: ADMIN_TOKEN_TTL, options: http.jwtOptions },
  );
}

function challenge(res: MedusaResponse, resourceMetadataUrl: string, error?: string) {
  const parts = [`resource_metadata="${resourceMetadataUrl}"`];
  if (error) parts.push('error="invalid_token"', `error_description="${error}"`);
  res
    .status(401)
    .set('WWW-Authenticate', `Bearer ${parts.join(', ')}`)
    .json({
      error: error ? 'invalid_token' : 'unauthorized',
      error_description: error ?? 'Sign in to use this MCP server',
    });
}

/** The MCP endpoint. Requires an access token this server issued for this resource, for a still-linked admin. */
async function serve(req: MedusaRequest, res: MedusaResponse) {
  const service = oauthService(req);
  const resourceMetadataUrl = `${service.config.issuer}/.well-known/oauth-protected-resource/mcp`;

  const bearer = /^Bearer\s+(\S+)$/i.exec(req.headers.authorization ?? '')?.[1];
  if (!bearer) return challenge(res, resourceMetadataUrl);
  const verified: VerifiedAccessToken | undefined = await service.verifyAccessToken(bearer, service.config.resource);
  if (!verified) return challenge(res, resourceMetadataUrl, 'The access token is invalid, expired, or revoked');

  const authIdentity = await req.scope
    .resolve<IAuthModuleService>(Modules.AUTH)
    .retrieveAuthIdentity(verified.auth_identity_id, { relations: ['provider_identities'] })
    .catch(() => undefined);
  if (authIdentity?.app_metadata?.user_id !== verified.user_id) {
    const [token] = await service.listMcpOAuthTokens({ id: verified.token_id });
    if (token) await service.revokeFamily(token.family_id);
    return challenge(res, resourceMetadataUrl, 'The admin account behind this token no longer exists');
  }

  const { plugins = [] } = req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE);
  const registry = getApiRegistry({
    projectRoot: process.cwd(),
    plugins: plugins.map((plugin: string | { resolve: string }) =>
      typeof plugin === 'string' ? plugin : plugin.resolve,
    ),
    blockedOperations: service.options.blockedOperations,
  });

  const auth: AuthInfo = {
    token: bearer,
    clientId: verified.client_id,
    scopes: verified.scopes,
    expiresAt: Math.floor(verified.expires_at.getTime() / 1000),
    resource: new URL(verified.resource),
    resourceMetadataUrl,
    extra: { user_id: verified.user_id },
  };
  (req as MedusaRequest & { auth: AuthInfo }).auth = auth;

  const handler = toNodeHandler(
    createMcpHandler(() =>
      buildMcpServer(registry, executionTarget(req, authIdentity, verified, registry.catalog.spec.revision)),
    ),
  );
  await handler(req, res, req.body);
}

export const GET = serve;
export const POST = serve;
export const DELETE = serve;

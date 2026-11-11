import {
  authenticate,
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { oauthService } from '../lib/oauth-http';
import { isLoopbackHost } from '../modules/mcp_oauth/config';

/** Medusa falls back to this for both secrets when they are unset outside production. */
const MEDUSA_DEFAULT_SECRET = 'supersecret';
const MIN_PUBLIC_SECRET_LENGTH = 16;

/** Which of Medusa's signing secrets are too weak to expose this server publicly. */
export function weakSecrets(http: { jwtSecret?: unknown; cookieSecret?: unknown }): string[] {
  return (
    [
      ['JWT_SECRET', http.jwtSecret],
      ['COOKIE_SECRET', http.cookieSecret],
    ] as const
  )
    .filter(
      ([, value]) =>
        value === undefined ||
        value === null ||
        (typeof value === 'string' && (value === MEDUSA_DEFAULT_SECRET || value.length < MIN_PUBLIC_SECRET_LENGTH)),
    )
    .map(([name]) => name);
}

/**
 * Refuses OAuth and MCP traffic when the issuer is public but Medusa still signs with a default or short secret.
 * Anyone could forge an admin token with a known JWT secret, so a public tunnel over one must fail closed.
 */
function requireStrongSecretsWhenPublic(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const issuer = new URL(oauthService(req).config.issuer);
  if (isLoopbackHost(issuer.hostname)) return next();
  const weak = weakSecrets(req.scope.resolve(ContainerRegistrationKeys.CONFIG_MODULE).projectConfig.http);
  if (!weak.length) return next();
  res.status(503).json({
    error: 'server_misconfigured',
    error_description: `${issuer.origin} is public, but ${weak.join(' and ')} ${weak.length > 1 ? 'are' : 'is'} unset, Medusa's default, or shorter than ${MIN_PUBLIC_SECRET_LENGTH} characters. Set strong random values and restart Medusa.`,
  });
}

/**
 * CORS for endpoints that browser-based MCP clients call directly. They are public or bearer-only and never read
 * cookies, so any origin may call them without credentials. Preflight requests are answered here.
 */
function allowCrossOrigin(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'authorization, content-type, accept, mcp-protocol-version, mcp-session-id, last-event-id',
  );
  res.setHeader('Access-Control-Expose-Headers', 'WWW-Authenticate, mcp-session-id, mcp-protocol-version');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
}

export default defineMiddlewares({
  routes: [
    {
      // Lets an admin already signed in to the Medusa admin skip the login form.
      matcher: '/oauth/authorize',
      method: ['GET'],
      middlewares: [authenticate('user', ['session'], { allowUnauthenticated: true })],
    },
    ...[
      '/oauth/token',
      '/oauth/register',
      '/.well-known/oauth-authorization-server',
      '/.well-known/oauth-protected-resource*',
      '/mcp',
    ].map((matcher) => ({ matcher, middlewares: [allowCrossOrigin] })),
    ...['/oauth*', '/mcp', '/.well-known/oauth-authorization-server', '/.well-known/oauth-protected-resource*'].map(
      (matcher) => ({ matcher, middlewares: [requireStrongSecretsWhenPublic] }),
    ),
  ],
});

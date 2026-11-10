import {
  authenticate,
  defineMiddlewares,
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from '@medusajs/framework/http';

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
  ],
});

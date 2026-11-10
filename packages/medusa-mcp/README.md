# @lambdacurry/medusa-mcp

A Medusa plugin that serves an MCP endpoint for AI agents. The tools are generated from the store's
OpenAPI spec, and agents sign in through OAuth issued by Medusa itself, so every call runs as a real
Medusa admin.

Status: in development on `feat/medusa-mcp`. Design and plan: Arbor thread DEM-17.

## What it serves

| Route | Purpose |
| --- | --- |
| `/mcp` | The MCP endpoint (Streamable HTTP). Requires a bearer token this server issued. |
| `/.well-known/oauth-authorization-server` | OAuth 2.1 metadata (PKCE S256, CIMD, DCR, `iss`). |
| `/.well-known/oauth-protected-resource/mcp` | Protected resource metadata for `/mcp`. |
| `/oauth/authorize`, `/oauth/token`, `/oauth/register` | Sign-in with a Medusa admin account, consent, tokens, and client registration. |

## Tools

| Tool | Scope | Does |
| --- | --- | --- |
| `search_api` | `mcp:read` | Ranked operations for a task, keyed `METHOD /path`. |
| `describe_api` | `mcp:read` | Parameters, request body, and response shape for one operation. |
| `read_api` | `mcp:read` | Calls a GET as the signed-in admin. |
| `write_api` | `mcp:write` | Calls a POST, PUT, or PATCH after validating the body. `dry_run` previews current vs proposed values. |
| `delete_api` | `mcp:delete` | Calls a DELETE. Marked destructive. |

Calls run against Medusa's own API as the admin who connected, with a short-lived admin JWT, so Medusa's
permissions and validators apply. A built-in blocklist (`src/mcp/policy.ts`) keeps agents away from auth,
API keys, invites, admin user changes, and arbitrary workflow runs. Writes and deletes are logged with the admin,
client, operation, and spec revision, and each token is limited to 120 calls and 30 changes per minute.

## Options

```ts
{
  resolve: '@lambdacurry/medusa-mcp',
  options: {
    issuer: process.env.MCP_ISSUER, // public origin, for example a tunnel URL; defaults to http://localhost:9000
    blockedOperations: ['DELETE /admin/products/{id}', '* /admin/gift-cards/**'], // added to the built-in list
  },
}
```

## Local development

The plugin is a Yarn workspace linked into `apps/medusa`, not installed through yalc, so
`medusa plugin:develop` is not used.

- `yarn dev` at the repo root builds the plugin first (Turbo `dependsOn: ["^build"]`), then starts the apps.
- After changing plugin code, run `yarn workspace @lambdacurry/medusa-mcp build` and restart Medusa. The
  running app does not reload when the plugin's build output changes.

## Notes

- `tsconfig.json` lists `src/api/.well-known/**/*` explicitly. TypeScript's `src/**/*` skips dot
  directories, and OAuth discovery needs routes under `/.well-known/`.
- `src/admin/` must exist even before the plugin has admin extensions. Without it, the app's admin build
  cannot resolve `@lambdacurry/medusa-mcp/admin`.
- The plugin resolves its own copy of `@medusajs/framework` from the root `node_modules`, while the app
  uses `apps/medusa/node_modules`. Routes, `MedusaError` handling, and modules with models and migrations
  all work across the two copies. Watch for it if something compares framework classes by identity.

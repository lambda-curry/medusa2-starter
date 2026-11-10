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

## Recording the demo locally

The demo: an agent in ChatGPT connects to a local Barrio, finds the product update operation, previews and applies a
new description for Barrio Decaf, and the storefront shows it. `apps/e2e/tests/mcp-demo.spec.ts` runs the same
script without ChatGPT.

1. **Pick a hostname** on a domain in your Cloudflare account and set it for the shell commands below:
   ```sh
   export HOST=mcp.example.com
   ```
2. **Configure the environment, with strong secrets.** `yarn generate-env` copies `JWT_SECRET=supersecret` and
   `COOKIE_SECRET=supersecret` from the public template, and Medusa also falls back to `supersecret` when they are
   unset. With a known JWT secret anyone can forge an admin token, so set both to new random values in
   `apps/medusa/.env`, for example from `openssl rand -base64 48`. While `MCP_ISSUER` is public, the plugin refuses
   OAuth and MCP requests with a 503 if either secret is unset, `supersecret`, or shorter than 16 characters.
   Also in `apps/medusa/.env`:
   - `MCP_ISSUER` set to your hostname written out, for example `MCP_ISSUER=https://mcp.example.com`. `.env` files
     do not expand `$HOST`.
   - `STOREFRONT_URL=http://localhost:3000` and a random `STOREFRONT_REVALIDATE_SECRET`. Put the same secret in
     `apps/storefront/.env`.

   Then run `yarn dev`. If Medusa was already running, restart it so the new secrets take effect.
3. **Replace the seeded admins. This step is required before opening the tunnel.** `yarn medusa:init` creates
   `admin@medusa-test.com` and `admin@lambdacurry.dev` with the passwords in `apps/medusa/package.json`, which is
   public. The tunnel puts the Medusa admin and this plugin's sign-in page on the internet, so anyone could use those
   accounts. With Medusa running, create your own admin with a long random password:
   ```sh
   yarn workspace medusa medusa user -e you@example.com -p '<long random password>'
   ```
   Then sign in as that admin at http://localhost:9000/app, open Settings → Users, and delete both seeded accounts.
4. **Open the tunnel** to Medusa:
   ```sh
   cloudflared tunnel create barrio-mcp
   cloudflared tunnel route dns barrio-mcp $HOST
   cloudflared tunnel run --url http://localhost:9000 barrio-mcp
   ```
5. **Check it from outside.** `curl https://$HOST/.well-known/oauth-authorization-server` should show
   `"issuer":"https://$HOST"`, and `curl -i -X POST https://$HOST/mcp` should answer `401` with a
   `resource_metadata` challenge.
6. **Connect ChatGPT.** At chatgpt.com/plugins, add a custom MCP server with URL `https://$HOST/mcp` and OAuth.
   Connecting opens the Medusa sign-in page. Sign in with the admin you created in step 3 and approve.
7. **Between takes**, run `yarn workspace medusa demo:reset` to restore the seeded titles and descriptions.

The tunnel exposes the local Medusa admin API to the internet while it runs. Stop it when you finish recording.

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

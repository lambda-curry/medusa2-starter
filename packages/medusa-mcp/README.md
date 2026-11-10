# @lambdacurry/medusa-mcp

A Medusa plugin that serves an MCP endpoint for AI agents. The tools are generated from the store's
OpenAPI spec, and agents sign in through OAuth issued by Medusa itself, so every call runs as a real
Medusa admin.

Status: in development on `feat/medusa-mcp`. Design and plan: Arbor thread DEM-17.

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

# Barrio (medusa2-starter)

Medusa 2 backend (`apps/medusa`), React Router storefront (`apps/storefront`), Playwright e2e (`apps/e2e`), and
the `@lambdacurry/medusa-mcp` plugin (`packages/medusa-mcp`), in one Yarn 4 + Turbo monorepo.

## Deploys

Railway auto-deploys `main` to the live Barrio store. The MCP work lands on `feat/medusa-mcp`, not `main`, until
someone decides to take it live.

## Commands

- `yarn dev`: builds workspace plugins, then starts Medusa and the storefront.
- `yarn test:unit`: unit tests for the Medusa app and the MCP plugin, the two workspaces that have them.
- `yarn workspace @lambdacurry/medusa-mcp build`: rebuild the plugin. Restart Medusa afterwards, because the running
  app does not reload plugin build output.
- `yarn e2e`: boots everything and runs Playwright. It runs `medusa:init`, which wipes the local database
  (`docker compose down -v`). Set `E2E_SKIP_MEDUSA_INIT=true` to keep the existing data.

## OpenAPI contracts for custom API routes

Every `route.ts` under `apps/medusa/src/api/admin` or `apps/medusa/src/api/store` needs an `openapi.ts` next to it.
The MCP plugin indexes the published spec built from these contracts, and
`apps/medusa/src/__tests__/openapi-contracts.unit.spec.ts` fails when a contract is missing or disagrees with its
route.

- The contract default-exports `{ tag, operations }` and documents exactly the methods the route exports.
- Each operation has a globally unique camelCase `operationId`, a `summary`, `responses`, and optional `query` and
  `body` Zod schemas. Import Zod from `@medusajs/framework/zod`.
- Set `hidden: true` to keep an internal or unsafe route out of the spec.
- Type the export with `satisfies OpenApiRouteContract` from `@lambdacurry/medusa-mcp/openapi`.

```ts
import type { OpenApiRouteContract } from '@lambdacurry/medusa-mcp/openapi';
import { z } from '@medusajs/framework/zod';

export default {
  tag: 'Widgets',
  operations: {
    GET: {
      operationId: 'listAdminWidgets',
      summary: 'List widgets',
      query: z.object({ limit: z.coerce.number().optional() }),
      responses: { 200: { description: 'Widgets', schema: z.object({ widgets: z.array(z.looseObject({ id: z.string() })) }) } },
    },
  },
} satisfies OpenApiRouteContract;
```

The core Medusa spec is pinned per Medusa version in `packages/medusa-mcp/specs/<version>`. After upgrading
`@medusajs/medusa`, run `yarn workspace @lambdacurry/medusa-mcp fetch-core-specs <version>`.

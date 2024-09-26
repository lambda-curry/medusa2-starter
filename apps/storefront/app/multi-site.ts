import { marketplacesCache } from '@libs/util/cache';
import { OrchestratorClient } from '@markethaus/orchestrator-client';

const ORCHESTRATOR_ENABLED = !!process.env['ORCHESTRATOR_API_BASE_URL'];

const client = new OrchestratorClient({
  baseUrl: process.env.ORCHESTRATOR_API_BASE_URL!,
  authToken: process.env.ORCHESTRATOR_API_TOKEN!
});

export const cacheMarketplaces = async () => {
  try {
    if (!ORCHESTRATOR_ENABLED) return;

    const { tenants } = await client.listTenants({ limit: 1000 });

    marketplacesCache.set('marketplaces', tenants);
  } catch (error) {
    console.error(error);
  }
};

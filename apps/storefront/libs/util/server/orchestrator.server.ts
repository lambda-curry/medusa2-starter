import { OrchestratorClient } from '@markethaus/orchestrator-client';
import { cachified } from '@epic-web/cachified';
import { newLRUCache } from './cache/cache.server';

const cache = newLRUCache({ max: 1000 });

export const client = new OrchestratorClient({
  baseUrl: process.env.ORCHESTRATOR_API_BASE_URL!,
  authToken: process.env.ORCHESTRATOR_API_TOKEN!
});

export const findTenantByHostname = (hostname: string) => {
  return cachified({
    key: `tenant-hostname-${hostname}`,
    cache: cache,
    staleWhileRevalidate: 150_000,
    async getFreshValue() {
      const { tenants } = await client.listTenants({
        storefront_hostname: hostname
      });

      return tenants?.[0];
    },
    /* 5 minutes until cache gets invalid
     * Optional, defaults to Infinity */
    ttl: 10_000,
    swr: Infinity
  });
};

export const getTenantAdminUrlByHostname = (hostname: string): string | Promise<string> => {
  if (!hostname || hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return new URL('http://localhost:7001').toString();
  }

  return findTenantByHostname(hostname).then(tenant => {
    const primaryDomain = tenant?.admin_domains.find(d => d.is_primary)?.hostname;
    return primaryDomain ? new URL(`https://${primaryDomain}`).toString() : '';
  });
};

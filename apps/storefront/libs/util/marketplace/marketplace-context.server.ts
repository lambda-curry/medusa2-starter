import { findTenantByHostname } from '../server/orchestrator.server';

export interface MarketplaceContext {
  tenant_id?: string;
  api_url: string;
  primary_host?: string;
}

export const getMarketplaceContext = async ({ headers, url }: Partial<Request>): Promise<MarketplaceContext> => {
  const MEDUSA_API_URL = process.env['INTERNAL_MEDUSA_API_URL'] || 'http://localhost:9000';

  const host = headers?.get('host');

  if (process.env.OVERRIDE_TENANT_HOSTNAME) {
    const tenant = await findTenantByHostname(process.env.OVERRIDE_TENANT_HOSTNAME);
    return {
      tenant_id: tenant?.id,
      api_url: MEDUSA_API_URL,
      primary_host: tenant?.storefront_domains.find(d => d.is_primary)?.hostname
    };
  }

  if (!host || host.endsWith('.loca.lt') || host.endsWith('.ngrok-free.app'))
    return {
      api_url: 'http://localhost:9000'
    };

  const hostname = new URL('http://' + host).hostname;

  const tenant = await findTenantByHostname(hostname);

  return {
    tenant_id: tenant?.id,
    api_url: MEDUSA_API_URL,
    primary_host: tenant?.storefront_domains.find(d => d.is_primary)?.hostname
  };
};

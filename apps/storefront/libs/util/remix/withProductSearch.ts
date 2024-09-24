import { Medusa } from '../medusa/client.server';

export const withProductSearch = (client: Medusa, searchTerm: string | null, offset = 0, limit?: number) => {
  return client.products.list({
    q: searchTerm ? `${searchTerm}` : undefined,
    offset,
    limit
  });
};

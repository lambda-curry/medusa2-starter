import cachified from '@epic-web/cachified';
import { sdk, sdkCache } from '@libs/util/server/client.server';
import { HttpTypes } from '@medusajs/types';
import { MILLIS } from './cache-builder.server';
import { getSelectedRegion } from './data/regions.server';

// Same page size the Medusa store API uses when no limit is sent.
export const PRODUCTS_PAGE_SIZE = 50;

// Reads the `page` search param written by the pagination links and turns it into limit/offset.
// Only a whole number made of digits counts as a page. Anything else, such as "2abc", "1.5", "-1",
// "0" or an empty value, falls back to the first page.
export const getProductsPaginationParams = (request: Request, limit = PRODUCTS_PAGE_SIZE) => {
  const pageParam = new URL(request.url).searchParams.get('page') ?? '';
  const page = /^\d+$/.test(pageParam) ? Number(pageParam) : 1;
  const offset = (page - 1) * limit;

  return { limit, offset: page > 1 && Number.isSafeInteger(offset) ? offset : 0 };
};

export const fetchProducts = async (request: Request, { ...query }: HttpTypes.StoreProductListParams = {}) => {
  const region = await getSelectedRegion(request.headers);

  return await cachified({
    key: `products-${JSON.stringify(query)}`,
    cache: sdkCache,
    staleWhileRevalidate: MILLIS.ONE_HOUR,
    ttl: MILLIS.TEN_SECONDS,
    async getFreshValue() {
      return await sdk.store.product.list({
        ...query,
        region_id: region.id,
      });
    },
  });
};

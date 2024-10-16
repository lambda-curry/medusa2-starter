import { sdk } from '@libs/util/server/client.server';
import { HttpTypes } from '@medusajs/types';
import { getSelectedRegion } from './data/regions.server';

export const fetchProducts = async (
  request: Request,
  { currency_code, ...query }: HttpTypes.StoreProductParams = {},
) => {
  const region = await getSelectedRegion(request.headers);

  return await sdk.store.product
    .list({
      ...query,
      region_id: region.id,
    })
    .catch((error) => {
      throw error;
    });
};

import { sdk } from '@libs/util/server/client.server';
import { HttpTypes } from '@medusajs/types';
import { getRegion, getSelectedRegion, retrieveRegion } from './regions.server';
import { sortProducts } from '@libs/util/sort-products';
import { withAuthHeaders } from '../auth.server';
import { SortOptions } from '@libs/types';

export const getProductsById = ({
  ids,
  regionId,
}: {
  ids: string[];
  regionId: string;
}) => {
  return sdk.store.product
    .list({
      id: ids,
      region_id: regionId,
      fields: '*variants.calculated_price,+variants.inventory_quantity',
    })
    .then(({ products }) => products);
};

export const getProductByHandle = async (handle: string, regionId: string) => {
  return sdk.store.product
    .list({
      handle,
      region_id: regionId,
      fields: '*variants.calculated_price,+variants.inventory_quantity',
    })
    .then(({ products }) => products[0]);
};

export const getProductsList = async ({
  pageParam = 1,
  queryParams,
  regionId,
}: {
  pageParam?: number;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
  regionId: string;
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number };
  nextPage: number | null;
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
}> => {
  const limit = queryParams?.limit || 12;
  const offset = (pageParam - 1) * limit;
  const region = await retrieveRegion(regionId);
  console.log('🚀 ~ getProductsList ~ region:', region);

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    };
  }

  return sdk.store.product
    .list({
      limit,
      offset,
      region_id: region.id,
      fields: '*variants.calculated_price',
      ...queryParams,
    })
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null;

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      };
    });
};

// /**
//  * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
//  * It will then return the paginated products based on the page and limit parameters.
//  */
// export const getProductsListWithSort = withAuthHeaders(
//   async (
//     request,
//     authHeaders,
//     {
//       page = 0,
//       queryParams,
//       sortBy = 'created_at',
//       countryCode,
//     }: {
//       page?: number;
//       queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
//       sortBy?: SortOptions;
//       countryCode: string;
//     }
//   ): Promise<{
//     response: { products: HttpTypes.StoreProduct[]; count: number };
//     nextPage: number | null;
//     queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams;
//   }> => {
//     const limit = queryParams?.limit || 12;
//     const region = await getSelectedRegion(request.headers);

//     const {
//       response: { products, count },
//     } = await getProductsList(request, {
//       pageParam: 0,
//       queryParams: {
//         ...queryParams,
//         limit: 100,
//       },
//       regionId: region.id,
//     });

//     const sortedProducts = sortProducts(products, sortBy);

//     const pageParam = (page - 1) * limit;

//     const nextPage = count > pageParam + limit ? pageParam + limit : null;

//     const paginatedProducts = sortedProducts.slice(
//       pageParam,
//       pageParam + limit
//     );

//     return {
//       response: {
//         products: paginatedProducts,
//         count,
//       },
//       nextPage,
//       queryParams,
//     };
//   }
// );

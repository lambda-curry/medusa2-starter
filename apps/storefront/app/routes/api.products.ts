import { buildObjectFromSearchParams } from '@marketplace/util/buildObjectFromSearchParams';
import type { StoreGetProductsParams } from '@markethaus/storefront-client';
import { json, LoaderFunctionArgs } from '@remix-run/node';
import { fetchProducts } from '@marketplace/util/server/products.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const query: StoreGetProductsParams = buildObjectFromSearchParams(url.searchParams);

  const { products } = await fetchProducts(request, query);

  return json({ products });
};

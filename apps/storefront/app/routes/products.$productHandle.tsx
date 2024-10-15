import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductTemplate } from '@app/templates/ProductTemplate';
import { getMergedProductMeta } from '@libs/util/products';
import { fetchProducts } from '@libs/util/server/products.server';
import { StoreProduct } from '@medusajs/types';

export const loader = async (args: LoaderFunctionArgs) => {
  const { products } = await fetchProducts(args.request, {
    handle: args.params.productHandle,
    fields: '*categories',
  }).catch((e) => {
    return { products: [] };
  });

  if (!products.length) {
    return redirect('/404');
  }

  return { product: products[0] };
};

export type ProductPageLoaderData = typeof loader;

export const meta: MetaFunction<ProductPageLoaderData> = getMergedProductMeta;

export default function ProductDetailRoute() {
  const { product } = useLoaderData<{
    product: StoreProduct;
  }>();

  if (!product) {
    return <div>404</div>;
  }

  return <ProductTemplate product={product} />;
}

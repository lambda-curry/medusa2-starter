import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductTemplate } from '@app/templates/ProductTemplate';
import { getMergedProductMeta } from '@libs/util/products';
import { fetchProducts } from '@libs/util/server/products.server';
import { fetchProductReviews, fetchProductReviewStats } from '@libs/util/server/data/product-reviews.server';
import { StoreListProductReviewsResponse, StoreListProductReviewStatsResponse } from '@lambdacurry/medusa-plugins-sdk';
import { ProductReviewSection } from '@app/components/reviews/ProductReviewSection';
import ProductList from '@app/components/sections/ProductList';
import { withPaginationParams } from '@libs/util/withPaginationParams';

export const loader = async (args: LoaderFunctionArgs) => {
  const { limit: reviewsLimit, offset: reviewsOffset } = withPaginationParams({
    request: args.request,
    defaultPageSize: 5,
  });

  const { products } = await fetchProducts(args.request, {
    handle: args.params.productHandle,
    fields: '*categories',
  });

  if (!products.length) throw redirect('/404');

  const product = products[0];

  const [productReviews, productReviewStats] = await Promise.all([
    fetchProductReviews({
      product_id: product.id,
      fields:
        'id,rating,content,name,images.url,created_at,updated_at,response.content,response.created_at,response.id',
      order: 'created_at',
      offset: reviewsOffset,
      limit: reviewsLimit,
    }),
    fetchProductReviewStats({
      product_id: product.id,
      offset: 0,
      limit: 1,
    }),
  ]);

  return { product, productReviews, productReviewStats };
};

export type ProductPageLoaderData = typeof loader;

export const meta: MetaFunction<ProductPageLoaderData> = getMergedProductMeta;

export default function ProductDetailRoute() {
  const { product, productReviews, productReviewStats } = useLoaderData<ProductPageLoaderData>();

  return (
    <>
      <ProductTemplate
        product={product}
        reviewsCount={productReviews.count}
        reviewStats={productReviewStats.product_review_stats[0]}
      />
      <ProductList className="!pb-[100px] xl:px-9" heading="You may also like" />
      <ProductReviewSection />
    </>
  );
}

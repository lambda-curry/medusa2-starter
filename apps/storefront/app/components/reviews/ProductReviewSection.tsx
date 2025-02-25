import { FC } from 'react';
import ProductReviewSummary from './ReviewSummary';
import { ProductReviewListWithPagination } from './ReviewListWithPagination';
import { useRouteLoaderData } from '@remix-run/react';
import { ProductPageLoaderData } from '../../routes/products.$productHandle';

export const ProductReviewSection: FC = () => {
  const data = useRouteLoaderData<ProductPageLoaderData>('routes/products.$productHandle');

  if (!data) return null;

  const { product, productReviews, productReviewStats } = data;

  if (!productReviews.count || productReviewStats.count < 1) return null;

  return (
    <section id="reviews" className="container mx-auto my-12 grid grid-cols-12 px-8">
      <ProductReviewSummary
        className="col-span-12 lg:col-span-4"
        stats={productReviewStats?.product_review_stats[0]}
        count={productReviews.count}
      />

      <ProductReviewListWithPagination
        className="col-span-12 my-16 lg:col-span-8 lg:col-start-6 lg:mt-0"
        productReviews={productReviews.product_reviews}
        context={`products/${product.handle}`}
        paginationConfig={{
          limit: productReviews.limit,
          offset: productReviews.offset,
          count: productReviews.count,
        }}
      />
    </section>
  );
};

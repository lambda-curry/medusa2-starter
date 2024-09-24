import { useRegion } from '@ui-components/hooks/useRegion';
import { useSendEventOnceOnMount } from '@marketplace/util/analytics/hooks/useSendEventOnceOnMount';
import { useSendEvent } from '@marketplace/util/analytics/useAnalytics';
import {
  redirect,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductTemplate } from '~/templates/ProductTemplate';
import { getMergedProductMeta } from '@marketplace/util/products';
import { withProductPostAndReviews } from '@marketplace/util/server/reviews.server';
import { Product, ProductWithReviews } from '@marketplace/util/medusa';

export const loader = async (args: LoaderFunctionArgs) => {
  const productPostAndReviewsData = await withProductPostAndReviews(args);
  if (!productPostAndReviewsData) throw redirect('/');
  return { ...productPostAndReviewsData };
};

export type ProductPageLoaderData = typeof loader;

export const meta: MetaFunction<ProductPageLoaderData> = getMergedProductMeta;

export default function ProductDetailRoute() {
  const { product, post } = useLoaderData<ProductPageLoaderData>();
  const { region } = useRegion();
  const sendViewItemEvent = useSendEvent('view_item');

  useSendEventOnceOnMount(() => {
    if (product)
      sendViewItemEvent({
        product: product as unknown as Product,
        currencyCode: region.currency_code,
      });
  });

  return (
    <ProductTemplate
      product={product as unknown as ProductWithReviews}
      post={post}
    />
  );
}

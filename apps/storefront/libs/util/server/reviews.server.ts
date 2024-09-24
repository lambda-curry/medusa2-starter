import { LoaderFunctionArgs } from '@remix-run/node';
import { withPaginationParams } from '../remix/withPaginationParams';
import { PostType, ProductWithReviews } from '..';
import { StoreGetProductsParams } from '@markethaus/storefront-client';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { getCartSession } from './cart-session.server';

export const fetchProductWithReviews = async ({
  id,
  request,
}: {
  id: string;
  request: Request;
}): Promise<ProductWithReviews | null> => {
  const client = await createMedusaClient({ request });

  const { regionId: region_id, currencyCode: currency_code } =
    await getCartSession(request.headers);

  const { product } = await client.products.retrieve(id, {
    region_id,
    currency_code,
  });

  if (!product) return null;

  const { stats } = await client.productReviews.retrieveStats({
    product_id: [product.id!],
  });

  return {
    ...product,
    reviewStats: stats[0],
  };
};

export const withProductPostAndReviews = async ({
  request,
  params,
}: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { regionId: region_id, currencyCode: currency_code } =
    await getCartSession(request.headers);

  const { products } = await client.products.list({
    handle: params.productHandle,
    region_id,
    currency_code,
    include_category_children: true,
  });
  const { limit, offset } = withPaginationParams({
    request,
    defaultPageSize: 4,
  });

  const product = products[0];

  if (!product) return null;

  const [{ posts }, { reviews, count }, { stats }] = await Promise.all([
    await client.posts.list({ type: PostType.PRODUCT, product_id: product.id }),
    await client.productReviews.list({
      product_id: product?.id,
      limit,
      offset,
    }),
    await client.productReviews.retrieveStats({ product_id: [product.id!] }),
  ]);

  const post = posts[0];
  const productWithReviews = { ...product, reviewStats: stats[0] };

  return {
    product: productWithReviews,
    post,
    reviews,
    limit,
    offset,
    count,
  };
};

export const withProductsAndReviewStats = async (
  request: Request,
  query: StoreGetProductsParams
) => {
  const { limit, offset } = withPaginationParams({ request });
  const client = await createMedusaClient({ request });
  const { regionId: region_id, currencyCode: currency_code } =
    await getCartSession(request.headers);

  if (limit) query.limit = limit;
  if (offset) query.offset = offset;

  const { products, ...rest } = await client.products.list({
    ...query,
    region_id,
    currency_code,
    include_category_children: true,
  });

  if (!products.length)
    return { products: [] as ProductWithReviews[], ...rest };
  const product_id = products.map(p => p.id!);

  const { stats } = await client.productReviews.retrieveStats({ product_id });

  const productsWithReviewStats = products.map(product => {
    const productStats = stats.find(s => s.product_id === product.id)!;

    return {
      ...product,
      reviewStats: productStats,
    };
  });

  return { products: productsWithReviewStats, ...rest };
};

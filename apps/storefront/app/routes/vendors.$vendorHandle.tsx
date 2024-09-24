import { ProductWithReviews } from '@marketplace/util/medusa';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { fetchPostData } from '@marketplace/util/server/posts.server';
import { withProductsAndReviewStats } from '@marketplace/util/server/reviews.server';
import { getMergedVendorMeta } from '@marketplace/util/vendors';
import { type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { VendorTemplate } from '~/templates/VendorTemplate';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  const { vendors } = await client.vendors.list({ handle: params.vendorHandle });

  const vendor = vendors[0];

  const { products, count, limit, offset } = await withProductsAndReviewStats(request, {
    vendor_id: [vendor?.id || '']
  });

  const { posts } = await client.posts.list({
    vendor_id: vendor?.id,
    limit,
    offset
  });

  const post = posts[0];

  const data = fetchPostData({ post: post!, request, params });

  return { vendor, post, products, count, limit, offset, ...data };
};

export const meta: MetaFunction<typeof loader> = getMergedVendorMeta;

export default function VendorDetailRoute() {
  const { vendor, post, products, ...data } = useLoaderData<typeof loader>();

  return <VendorTemplate vendor={vendor} post={post} products={products as ProductWithReviews[]} data={data} />;
}

import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { Post, PostTemplate, ProductWithReviews, Vendor } from '@marketplace/util/medusa/types';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { ProductTemplate } from '~/templates/ProductTemplate';
import { PageTemplate } from '../templates/PageTemplate';
import { VendorTemplate } from '../templates/VendorTemplate';
import { fetchProductWithReviews } from '@marketplace/util/server/reviews.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });

  const type = params.type;
  const isTemplate = params.template === 'template';

  const url = new URL(request.url);
  if (type === 'page' || isTemplate) return { type };

  if (type === 'product') {
    const productId = url.searchParams.get('product_id');
    if (!productId) throw redirect('/');

    const product = await fetchProductWithReviews({ id: productId, request });

    if (!product) throw redirect('/');

    return { product, type };
  }

  if (type === 'vendor') {
    const vendorId = url.searchParams.get('vendor_id');
    if (!vendorId) throw redirect('/');
    const { vendor } = await client.vendors.retrieve(vendorId);
    if (!vendor) throw redirect('/');
    return { vendor, type };
  }

  throw redirect('/');
};

export default function PreviewRoute() {
  const { product, vendor } = useLoaderData<typeof loader>();
  const { post } = useOutletContext<{ post: Post | PostTemplate }>();

  if (product) {
    return <ProductTemplate product={product as ProductWithReviews} post={post} isPreview />;
  }

  if (vendor) {
    return <VendorTemplate vendor={vendor} post={post} isPreview />;
  }

  return <PageTemplate post={post} isPreview />;
}

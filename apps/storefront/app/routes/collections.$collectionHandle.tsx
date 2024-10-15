import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductListWithPagination } from '@app/components/product/ProductListWithPagination';
import { sdk } from '@libs/util/server/client.server';
import { Container } from '@app/components/common/container';
import { Breadcrumbs } from '@app/components/common/breadcrumbs';
import { getSelectedRegion } from '@libs/util/server/data/regions.server';
import { getCollectionByHandle } from '@libs/util/server/data/collections.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const region = await getSelectedRegion(request.headers);
  const handle = params.collectionHandle as string;

  const collection = await getCollectionByHandle(handle);

  if (!collection) {
    throw redirect('/products');
  }

  const { products, count, limit, offset } = await sdk.store.product.list({
    region_id: region?.id,
    collection_id: collection.id,
  });

  return { products, count, limit, offset, collection };
};

export type ProductCollectionRouteLoader = typeof loader;

export default function ProductCollectionRoute() {
  const data = useLoaderData<ProductCollectionRouteLoader>();

  if (!data) return null;

  const { products, count, limit, offset } = data;

  const breadcrumbs = [
    {
      label: (
        <span className="flex whitespace-nowrap">
          <HomeIcon className="inline h-4 w-4" />
          <span className="sr-only">Home</span>
        </span>
      ),
      url: `/`,
    },
    {
      label: 'All Products',
      url: '/products',
    },
    {
      label: data.collection.title,
    },
  ];

  return (
    <Container className="pb-16">
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <ProductListWithPagination
            products={products}
            paginationConfig={{ count, offset, limit }}
            context="products"
          />
        </div>
      </div>
    </Container>
  );
}

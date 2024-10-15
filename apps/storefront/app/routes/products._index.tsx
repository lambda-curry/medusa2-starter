import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductListWithPagination } from '@app/components/product/ProductListWithPagination';
import { sdk } from '@libs/util/server/client.server';
import { Container } from '@app/components/common/container';
import { Breadcrumbs } from '@app/components/common/breadcrumbs';
import { getSelectedRegion } from '@libs/util/server/data/regions.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const region = await getSelectedRegion(request.headers);
  const { products, count, limit, offset } = await sdk.store.product.list({
    region_id: region?.id,
  });

  return { products, count, limit, offset };
};

export type ProductsIndexRouteLoader = typeof loader;

export default function ProductsIndexRoute() {
  const data = useLoaderData<ProductsIndexRouteLoader>();

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

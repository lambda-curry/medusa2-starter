import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductListWithPagination } from '@app/components/product/ProductListWithPagination';
import { sdk } from '@libs/util/server/client.server';
import { Container } from '@app/components/common/container';
import { Breadcrumbs } from '@app/components/common/breadcrumbs';
import { getSelectedRegion } from '@libs/util/server/data/regions.server';
import { getCategoryByHandle } from '@libs/util/server/data/categories.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const region = await getSelectedRegion(request.headers);
  const handle = params.categoryHandle as string;

  const category = await getCategoryByHandle([handle]);

  if (!category) {
    throw redirect('/products');
  }

  const { products, count, limit, offset } = await sdk.store.product.list({
    region_id: region?.id,
    category_id: category.id,
  });

  return { products, count, limit, offset, category };
};

export type ProductCategoryRouteLoader = typeof loader;

export default function ProductCategoryRoute() {
  const data = useLoaderData<ProductCategoryRouteLoader>();

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
      label: data.category.name,
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

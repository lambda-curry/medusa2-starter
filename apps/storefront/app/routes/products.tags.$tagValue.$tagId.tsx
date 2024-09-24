import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { Breadcrumbs } from '@components/breadcrumbs/Breadcrumbs';
import { Container } from '@components/container/Container';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { FilterOptions } from '@marketplace/util/product-filters';
import { withPaginationParams } from '@marketplace/util/remix/withPaginationParams';
import {
  fetchDynamicFilterOptions,
  fetchFilterOptions,
} from '@marketplace/util/server/product-filters.server';
import { withProductsAndReviewStats } from '@marketplace/util/server/reviews.server';
import { redirect, type LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductListWithPagination } from '~/components/products/ProductListWithPagination';
import { ProductPageFilters } from '../../libs/ui-components/product/ProductFilters/ProductPageFilters';
import { ProductListHeader } from '../../libs/ui-components/product/ProductListHeader';
import { ProductWithReviews } from '@marketplace/util/medusa';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { limit, offset } = withPaginationParams({ request });
  const { filterQuery, allFilterOptions, filterOptions } =
    await fetchDynamicFilterOptions(request);
  const tag = allFilterOptions.tags?.find(tag => tag.value === params.tagValue);

  if (!tag) throw redirect('/products');

  const allTagFilterOptions = await fetchFilterOptions(client, {
    tags: [tag.id],
  });
  delete allTagFilterOptions.tags;

  const { products, count } = await withProductsAndReviewStats(request, {
    ...filterQuery,
    tags: [tag.id],
    limit,
    offset,
  });

  return {
    products,
    count,
    limit,
    offset,
    tag,
    allFilterOptions: allTagFilterOptions,
    filterOptions,
  };
};

export default function TagDetailRoute() {
  const {
    products,
    count,
    limit,
    offset,
    tag,
    allFilterOptions,
    filterOptions,
  } = useLoaderData<typeof loader>();

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
      label: tag.value,
    },
  ];

  return (
    <Container className="pb-16">
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <ProductListHeader>
        <div className="flex flex-wrap items-center gap-2">
          Tagged with
          <span className="bg-primary-100 text-primary-700 ring-primary-500/20 py-0.25 inline-flex items-center rounded-lg px-2 font-medium ring-[0.5px] ring-inset">
            {tag.value}
          </span>
        </div>
      </ProductListHeader>

      <div className="flex flex-col gap-4 sm:flex-row">
        <ProductPageFilters
          allFilterOptions={allFilterOptions as FilterOptions}
          filterOptions={filterOptions as FilterOptions}
        />
        <div className="flex-1">
          <ProductListWithPagination
            products={products as ProductWithReviews[]}
            paginationConfig={{ count, offset, limit }}
            context={`tags/${tag.value}`}
          />
        </div>
      </div>
    </Container>
  );
}

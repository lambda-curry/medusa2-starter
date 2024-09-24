import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { Breadcrumbs } from '@components/breadcrumbs/Breadcrumbs';
import { Container } from '@components/container/Container';
import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductListWithPagination } from '~/components/products/ProductListWithPagination';
import { ProductPageFilters } from '../../libs/ui-components/product/ProductFilters/ProductPageFilters';
import { ProductSortDropdown } from '../components/products/ProductSortDropdown';
import { fetchDynamicFilterOptions } from '@marketplace/util/server/product-filters.server';
import { withProductsAndReviewStats } from '@marketplace/util/server/reviews.server';
import { FilterOptions } from '@marketplace/util/product-filters';
import { ProductWithReviews } from '@marketplace/util/medusa';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { filterQuery, allFilterOptions, filterOptions } =
    await fetchDynamicFilterOptions(request);
  const { products, count, limit, offset } = await withProductsAndReviewStats(
    request,
    filterQuery
  );

  return { products, count, limit, offset, allFilterOptions, filterOptions };
};

export type ProductsIndexRouteLoader = typeof loader;

export default function ProductsIndexRoute() {
  const data = useLoaderData<ProductsIndexRouteLoader>();
  if (!data) return null;

  const { products, count, limit, offset, allFilterOptions, filterOptions } =
    data;

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
    {
      label: (
        <ProductSortDropdown
          filterOptions={filterOptions as FilterOptions}
          allFilterOptions={allFilterOptions as FilterOptions}
        />
      ),
    },
  ];

  return (
    <Container className="pb-16">
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <ProductPageFilters
          allFilterOptions={allFilterOptions as FilterOptions}
          filterOptions={filterOptions as FilterOptions}
        />
        <div className="flex-1">
          <ProductListWithPagination
            products={products as ProductWithReviews[]}
            paginationConfig={{ count, offset, limit }}
            context="products"
          />
        </div>
      </div>
    </Container>
  );
}

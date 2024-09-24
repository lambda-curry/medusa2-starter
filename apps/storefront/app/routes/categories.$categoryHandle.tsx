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
  const category = allFilterOptions.categories?.find(
    category => category.handle === params.categoryHandle
  );
  const allCategoryFilterOptions = await fetchFilterOptions(client, {
    category_id: [category?.id || ''],
  });
  delete allCategoryFilterOptions.categories;

  if (!category) throw redirect('/products');

  const { products, count } = await client.products.list({
    ...filterQuery,
    category_id: [category.id || ''],
    limit,
    offset,
  });

  return {
    products,
    category,
    count,
    limit,
    offset,
    allFilterOptions: allCategoryFilterOptions,
    filterOptions,
  };
};

export default function CategoryDetailRoute() {
  const {
    products,
    category,
    count,
    limit,
    offset,
    allFilterOptions,
    filterOptions,
  } = useLoaderData<typeof loader>();

  const createBreadcrumbs = () => {
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
    ];

    if (category.parent_category_id) {
      const parentCategory = allFilterOptions.categories?.find(
        c => c.id === category.parent_category_id
      );
      if (parentCategory) {
        breadcrumbs.push({
          label: parentCategory.name,
          url: `/categories/${parentCategory.handle}`,
        });
      }
    }

    breadcrumbs.push({
      label: category.name,
      url: `/categories/${category.handle}`,
    });

    return breadcrumbs;
  };

  const breadcrumbs = createBreadcrumbs();

  return (
    <Container className="pb-16">
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <ProductListHeader heading={category.name} />

      <div className="flex flex-col gap-4 sm:flex-row">
        <ProductPageFilters
          allFilterOptions={allFilterOptions as FilterOptions}
          filterOptions={filterOptions as FilterOptions}
        />
        <div className="flex-1">
          <ProductListWithPagination
            products={products as ProductWithReviews[]}
            paginationConfig={{ count, offset, limit }}
            context={`categories/${category.handle}`}
          />
        </div>
      </div>
    </Container>
  );
}

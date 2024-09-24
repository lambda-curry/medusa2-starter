import HomeIcon from '@heroicons/react/24/solid/HomeIcon';
import { Breadcrumbs } from '@components/breadcrumbs/Breadcrumbs';
import { Container } from '@components/container/Container';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { withPaginationParams } from '@marketplace/util/remix/withPaginationParams';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { ProductListWithPagination } from '~/components/products/ProductListWithPagination';
import {
  fetchDynamicFilterOptions,
  fetchFilterOptions,
} from '@marketplace/util/server/product-filters.server';
import { ProductPageFilters } from '../../libs/ui-components/product/ProductFilters/ProductPageFilters';
import { ProductListHeader } from '../../libs/ui-components/product/ProductListHeader';
import { ProductWithReviews } from '../../libs/util';
import { FilterOptions } from '@marketplace/util/product-filters';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { limit, offset } = withPaginationParams({ request });
  const { filterQuery, allFilterOptions, filterOptions } =
    await fetchDynamicFilterOptions(request);
  const collection = allFilterOptions.collections?.find(
    collection => collection.handle === params.collectionHandle
  );

  if (!collection) throw redirect('/products');

  const allCollectionFilterOptions = await fetchFilterOptions(client, {
    collection_id: [collection.id],
  });
  delete allCollectionFilterOptions.collections;

  const { products, count } = await client.products.list({
    ...filterQuery,
    collection_id: [collection.id],
    limit,
    offset,
  });

  return {
    products,
    collection,
    count,
    limit,
    offset,
    allFilterOptions: allCollectionFilterOptions,
    filterOptions,
  };
};

export default function CollectionDetailRoute() {
  const {
    products,
    collection,
    count,
    limit,
    offset,
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
      label: collection?.title,
    },
  ];

  return (
    <Container className="pb-16">
      <div className="my-8 flex flex-wrap items-center justify-between gap-4">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>
      <ProductListHeader heading={collection.title} />

      <div className="flex flex-col gap-4 sm:flex-row">
        <ProductPageFilters
          allFilterOptions={allFilterOptions as FilterOptions}
          filterOptions={filterOptions as FilterOptions}
        />
        <div className="flex-1">
          <ProductListWithPagination
            products={products as ProductWithReviews[]}
            paginationConfig={{ count, offset, limit }}
            context={`collections/${collection.handle}`}
          />
        </div>
      </div>
    </Container>
  );
}

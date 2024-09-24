import { useSearch } from '@ui-components/hooks/useSearch';
import { Input } from '@components/forms/inputs/Input';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import {
  withCollectionSearch,
  withPaginationParams,
  withProductSearch,
} from '@marketplace/util/remix';
import { ProductListWithPagination } from '~/components/products/ProductListWithPagination';
import { LoaderFunctionArgs } from '@remix-run/node';
import { ProductWithReviews } from '@marketplace/util/medusa';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const client = await createMedusaClient({ request });
  const { searchTerm, offset, limit } = withPaginationParams({ request });
  const { products, count: productCount } = await withProductSearch(
    client,
    searchTerm,
    offset,
    limit
  );
  const { collections } = await withCollectionSearch(products);

  return {
    products,
    collections: collections.filter(c => !!c),
    searchTerm,
    paginationConfig: { count: productCount, offset, limit },
  };
};

export default function SearchPage() {
  const { handleSearchChange, searchFetcher } = useSearch();
  const searchTerm = searchFetcher.data?.searchTerm;
  const context = searchTerm ? `search?term=${searchTerm}` : 'search?';
  const paginationConfig = searchFetcher.data?.paginationConfig;
  let products = searchFetcher.data?.products;

  return (
    <>
      <div className="mb-8 flex w-full justify-center">
        <Input
          autoComplete="off"
          type="text"
          name="term"
          value={undefined}
          onChange={handleSearchChange}
          defaultValue={searchTerm ?? undefined}
          placeholder="Search products..."
        />
      </div>
      <div>
        {products && (
          <ProductListWithPagination
            products={products as ProductWithReviews[]}
            context={context}
            paginationConfig={paginationConfig}
          />
        )}
      </div>
    </>
  );
}

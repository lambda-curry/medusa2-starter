import { Container } from '@app/components/common/container';
import { ProductListWithPagination } from '@app/components/product/ProductListWithPagination';
import { PageHeading } from '@app/components/sections/PageHeading';
import { fetchCollections } from '@libs/util/server/data/collections.server';
import { fetchProducts, getProductsPaginationParams } from '@libs/util/server/products.server';
import clsx from 'clsx';
import { LoaderFunctionArgs, NavLink, redirect, useLoaderData } from 'react-router';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const handle = params.collectionHandle as string;

  const { collections } = await fetchCollections();

  const collection = collections?.find((collection) => collection.handle === handle);

  if (!collection) throw redirect('/products');

  const { products, count, limit, offset } = await fetchProducts(request, {
    ...getProductsPaginationParams(request),
    collection_id: collection.id,
  });

  return { products, count, limit, offset, collections, collection };
};

export type ProductCollectionRouteLoader = typeof loader;

export default function ProductCollectionRoute() {
  const data = useLoaderData<ProductCollectionRouteLoader>();

  if (!data) return null;

  const { products, count, limit, offset, collections, collection } = data;

  return (
    <Container className="pb-16">
      <PageHeading className="w-full text-center text-5xl xs:text-6xl md:text-8xl font-ballet mt-24 font-normal lg:font-normal">
        {collection.title}
      </PageHeading>

      {collections.length > 1 && (
        <div className="flex flex-col w-full items-center">
          <div className="flex-1">
            <div className="inline-flex gap-5 text-2xl font-italiana border-b border-primary mt-4 mb-8">
              {collections.map((collection) => (
                <NavLink
                  to={`/collections/${collection.handle}`}
                  key={collection.id}
                  className={({ isActive }) =>
                    clsx('h-full p-4', {
                      'font-bold border-b-2 border-primary': isActive,
                      '!border-none active:': !isActive,
                    })
                  }
                >
                  {collection.title}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

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

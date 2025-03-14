import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { NavLink, useLoaderData } from '@remix-run/react';
import { ProductListWithPagination } from '@app/components/product/ProductListWithPagination';
import { Container } from '@app/components/common/container';
import { listCategories } from '@libs/util/server/data/categories.server';
import { PageHeading } from '@app/components/sections/PageHeading';
import clsx from 'clsx';
import { fetchProducts } from '@libs/util/server/products.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const handle = params.categoryHandle as string;

  const categories = await listCategories();

  const category = categories.find((c) => c.handle === handle);

  if (!category) {
    throw redirect('/products');
  }

  const { products, count, limit, offset } = await fetchProducts(request, {
    category_id: category.id,
  });

  return {
    products,
    count,
    limit,
    offset,
    category,
    categories,
  };
};

export type ProductCategoryRouteLoader = typeof loader;

export default function ProductCategoryRoute() {
  const data = useLoaderData<ProductCategoryRouteLoader>();

  if (!data) return null;

  const { products, count, limit, offset, categories } = data;

  return (
    <Container className="pb-16">
      <PageHeading className="w-full text-center text-5xl xs:text-6xl md:text-8xl font-inter mt-24 lg:font-normal">
        {data.category.name}
      </PageHeading>

      {categories.length > 1 && (
        <div className="flex flex-col w-full items-center">
          <div className="flex-1">
            <div className="inline-flex gap-5 text-2xl font-inter border-b border-primary mt-4 mb-8">
              {categories.map((category) => (
                <NavLink
                  to={`/categories/${category.handle}`}
                  key={category.id}
                  prefetch="viewport"
                  className={({ isActive }) =>
                    clsx('h-full p-4', {
                      'font-bold border-b-2 border-primary': isActive,
                      '!border-none active:': !isActive,
                    })
                  }
                >
                  {category.name}
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

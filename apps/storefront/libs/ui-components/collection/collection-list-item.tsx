import { Await, Link } from '@remix-run/react';
import { Suspense, type FC } from 'react';
import { type ProductCollection, type ProductWithReviews } from '../../util';
import ProductCarousel from '../product/ProductCarousel';
import { ProductCarouselSkeleton } from '../product/ProductCarouselSkeleton';

export interface CollectionListItemContentProps {
  collection: ProductCollection;
}

export interface CollectionListItemProps extends CollectionListItemContentProps {
  className?: string;
  collection: ProductCollection;
  deferredProducts: Promise<{ products: ProductWithReviews[] }>;
}

export const CollectionListItem: FC<CollectionListItemProps> = ({ collection, deferredProducts }) => {
  return (
    <>
      <Link
        to={`/collections/${collection.handle}`}
        className="relative flex flex-col overflow-hidden rounded-lg p-6 hover:opacity-75 xl:w-auto"
      >
        <span className="relative mt-auto text-center text-xl font-bold">{collection.title}</span>
      </Link>

      <Suspense fallback={<ProductCarouselSkeleton length={4} />}>
        <Await resolve={deferredProducts}>{({ products }) => <ProductCarousel products={products} />}</Await>
      </Suspense>
    </>
  );
};

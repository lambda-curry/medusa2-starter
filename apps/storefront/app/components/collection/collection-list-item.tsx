import { StoreCollection, StoreProduct } from '@medusajs/types';
import { type FC, Suspense } from 'react';
import { Await, Link } from 'react-router';
import ProductCarousel from '../product/ProductCarousel';
import { ProductCarouselSkeleton } from '../product/ProductCarouselSkeleton';

export interface CollectionListItemContentProps {
  collection: StoreCollection;
}

export interface CollectionListItemProps extends CollectionListItemContentProps {
  className?: string;
  collection: StoreCollection;
  deferredProducts: Promise<{ products: StoreProduct[] }>;
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

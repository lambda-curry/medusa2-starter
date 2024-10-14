import type { FC } from 'react';
import type { CollectionListItemProps } from './collection-list-item';
import { StoreCollection, StoreProduct } from '@medusajs/types';

export const CollectionList: FC<{
  title?: string;
  collections: StoreCollection[];
  deferredProductsByCollection: Record<
    string,
    Promise<{
      products: StoreProduct[];
    }>
  >;
  renderCollectionListItem: FC<CollectionListItemProps>;
}> = ({ collections, title = 'Collections', deferredProductsByCollection, renderCollectionListItem }) => {
  const CollectionListItem = renderCollectionListItem;

  return (
    <div className="bg-white">
      <div className="py-16 sm:py-24 xl:mx-auto xl:max-w-7xl xl:px-8">
        <div className="px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-0">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{title}</h2>
        </div>

        <div className="mt-4">
          <div className="relative">
            {collections.map((collection) => {
              const deferredProducts = deferredProductsByCollection[collection.handle!];
              return (
                <CollectionListItem key={collection.id} deferredProducts={deferredProducts} collection={collection} />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import _uniqBy from 'lodash/uniqBy';
import _sortBy from 'lodash/sortBy';
import { PricedProduct, ProductCollection } from '../medusa';

export const withCollectionSearch: (
  products: PricedProduct[]
) => Promise<{ collections: ProductCollection[]; count: number }> = products => {
  const collections = _sortBy(
    _uniqBy(
      products
        .filter(p => p.collection)
        .map(product => product.collection!)
        .sort(),
      'handle'
    )
  );
  return Promise.resolve({ collections, count: collections.length });
};

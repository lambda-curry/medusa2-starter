// import Medusa from '@medusajs/medusa-js';
import _uniqBy from 'lodash/uniqBy';
import _flatten from 'lodash/flatten';
import _sortBy from 'lodash/sortBy';
import { Product, ProductTag } from '../medusa';

export const withTagSearch: (products: Product[]) => Promise<{ tags: ProductTag[]; count: number }> = products => {
  const tags = _sortBy(
    _flatten(
      _uniqBy(
        products.map(product => product.tags!),
        'handle'
      )
    ),
    ['value']
  );

  return Promise.resolve({ tags, count: tags.length });
};

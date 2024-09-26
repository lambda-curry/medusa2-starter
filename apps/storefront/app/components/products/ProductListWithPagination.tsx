import type { FC } from 'react';
import { PaginationWithContext } from '@components/Pagination/pagination-with-context';
import {
  type ProductListProps,
  ProductGrid,
} from '@ui-components/product/ProductGrid';
import type { PaginationConfig } from '@components/Pagination';
import { ProductWithReviews } from '../../../libs/util/medusa';

export interface ProductListWithPaginationProps extends ProductListProps {
  products?: ProductWithReviews[];
  paginationConfig?: PaginationConfig;
  context: string;
}

export const ProductListWithPagination: FC<ProductListWithPaginationProps> = ({
  context,
  paginationConfig,
  ...props
}) => (
  <div>
    <ProductGrid {...props} />
    {paginationConfig && (
      <PaginationWithContext
        context={context}
        paginationConfig={paginationConfig}
      />
    )}
  </div>
);

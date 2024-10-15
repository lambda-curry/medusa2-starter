import type { FC } from 'react';
import { PaginationWithContext } from '@app/components/common/Pagination/pagination-with-context';
import { type ProductListProps, ProductGrid } from '@app/components/product/ProductGrid';
import type { PaginationConfig } from '@app/components/common/Pagination';
import { StoreProduct } from '@medusajs/types';

export interface ProductListWithPaginationProps extends ProductListProps {
  products?: StoreProduct[];
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
    {paginationConfig && <PaginationWithContext context={context} paginationConfig={paginationConfig} />}
  </div>
);

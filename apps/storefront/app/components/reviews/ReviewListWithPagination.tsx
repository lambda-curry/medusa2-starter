import { FC } from 'react';
import { PaginationWithContext } from '@components/src/Pagination/pagination-with-context';
import { PaginationConfig } from '@components/src/Pagination';
import type { ProductReview } from '@marketplace/util/medusa/types';
import { ProductReviewList, ProductReviewListProps } from './ProductReviewList';

export interface ProductReviewListWithPaginationProps
  extends ProductReviewListProps {
  productReviews: ProductReview[];
  paginationConfig?: PaginationConfig;
  context: string;
}

export const ProductReviewListWithPagination: FC<
  ProductReviewListWithPaginationProps
> = ({ context, paginationConfig, className, ...props }) => (
  <>
    <div className={className}>
      <ProductReviewList {...props} />
      {paginationConfig && (
        <PaginationWithContext
          context={context}
          paginationConfig={paginationConfig}
          section={'reviews'}
        />
      )}
    </div>
  </>
);

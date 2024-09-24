import { FC, lazy } from 'react';
import PostSectionProductList, {
  PostSectionProductListProps,
} from './shared/PostSectionProductList';
import { ProductGridSkeleton } from '@ui-components/product/ProductGridSkeleton';

const ProductGrid = lazy(() => import('../../product/ProductGrid'));

export const PostSectionProductListGrid: FC<PostSectionProductListProps> = ({
  isPreview,
  ...props
}) => {
  return (
    <PostSectionProductList
      {...props}
      component={ProductGrid}
      fallback={<ProductGridSkeleton length={3} />}
    />
  );
};

export default PostSectionProductListGrid;

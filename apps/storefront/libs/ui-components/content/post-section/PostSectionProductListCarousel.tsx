import { FC, Suspense, lazy } from 'react';
import PostSectionProductList, {
  PostSectionProductListProps,
} from './shared/PostSectionProductList';
import { ProductCarouselSkeleton } from '@ui-components/product/ProductCarouselSkeleton';

const ProductCarousel = lazy(() => import('../../product/ProductCarousel'));

export const PostSectionProductListCarousel: FC<
  PostSectionProductListProps
> = ({ isPreview, ...props }) => {
  return (
    <PostSectionProductList
      {...props}
      component={ProductCarousel}
      fallback={<ProductCarouselSkeleton length={3} />}
    />
  );
};
export default PostSectionProductListCarousel;

import { NavLink } from '@remix-run/react';
import clsx from 'clsx';
import { memo, type FC } from 'react';
import { useScrollArrows } from '@app/hooks/useScrollArrows';
import { ScrollArrowButtons } from '@app/components/common/buttons/ScrollArrowButtons';
import { ProductCarouselSkeleton } from './ProductCarouselSkeleton';
import type { ProductListItemProps } from './ProductListItem';
import { ProductListItem } from './ProductListItem';
import { StoreProduct } from '@medusajs/types';

export interface ProductCarouselProps {
  products?: StoreProduct[];
  className?: string;
  renderItem?: FC<ProductListItemProps>;
}

export const ProductRow: FC<{ products: StoreProduct[] }> = memo(({ products }) => {
  return (
    <>
      {products.map((product) => (
        <div
          key={product.id}
          // Note: not sure if there is a better way to handle the width of these items, but these match closely to our grid layout
          className="xs:w-[47.5%] xs:snap-start mr-6 inline-block w-[100%] snap-center last:mr-0 sm:mr-6 sm:snap-start md:w-[31.2%] xl:mr-8 xl:w-[23%]"
        >
          <NavLink prefetch="intent" to={`/products/${product.handle}`} viewTransition>
            {({ isTransitioning }) => <ProductListItem isTransitioning={isTransitioning} product={product} />}
          </NavLink>
        </div>
      ))}
    </>
  );
});

export const ProductCarousel: FC<ProductCarouselProps> = ({ products, className }) => {
  const { scrollableDivRef, ...scrollArrowProps } = useScrollArrows({
    buffer: 100,
    resetOnDepChange: [products],
  });

  if (!products) return <ProductCarouselSkeleton length={4} />;

  return (
    <div className={clsx('product-carousel relative', className)}>
      <div
        ref={scrollableDivRef}
        className="w-full snap-both snap-mandatory overflow-x-auto whitespace-nowrap pb-2 sm:snap-proximity"
      >
        <ProductRow products={products} />
      </div>
      <ScrollArrowButtons className="-mt-12" {...scrollArrowProps} />
    </div>
  );
};

export default ProductCarousel;

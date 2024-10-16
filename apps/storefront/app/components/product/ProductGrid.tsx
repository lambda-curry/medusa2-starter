import { NavLink, useNavigation } from '@remix-run/react';
import clsx from 'clsx';
import type { FC } from 'react';
import { ProductGridSkeleton } from './ProductGridSkeleton';
import { ProductListHeader, type ProductListHeaderProps } from './ProductListHeader';
import { ProductListItem } from './ProductListItem';
import { StoreProduct } from '@medusajs/types';

export interface ProductListProps extends Partial<ProductListHeaderProps> {
  products?: StoreProduct[];
  className?: string;
}

export const ProductGrid: FC<ProductListProps> = ({
  heading,
  actions,
  products,
  className = 'grid grid-cols-1 gap-y-6 @md:grid-cols-2 gap-x-4 @2xl:!grid-cols-3 @4xl:!grid-cols-4 @4xl:gap-x-4',
}) => {
  const navigation = useNavigation();
  const isLoading = navigation.state !== 'idle';

  if (!products) return <ProductGridSkeleton length={5} />;

  return (
    <div
      className={clsx('@container', {
        'animate-pulse': isLoading,
      })}
    >
      <ProductListHeader heading={heading} actions={actions} />

      <div className={className}>
        {products?.map((product) => (
          <NavLink prefetch="intent" key={product.id} to={`/products/${product.handle}`} viewTransition>
            {({ isTransitioning }) => <ProductListItem isTransitioning={isTransitioning} product={product} />}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

// required for lazy loading this component
export default ProductGrid;

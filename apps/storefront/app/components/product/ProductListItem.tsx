import type { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';
import { ProductThumbnail } from './ProductThumbnail';
import { ProductPrice } from './ProductPrice';
import { ProductBadges } from './ProductBadges';
import { useRegion } from '@app/hooks/useRegion';
import { StoreProduct } from '@medusajs/types';

export interface ProductListItemProps extends HTMLAttributes<HTMLElement> {
  product: StoreProduct;
  isTransitioning?: boolean;
}

export const ProductListItem: FC<ProductListItemProps> = ({ product, className, isTransitioning, ...props }) => {
  const { region } = useRegion();

  return (
    <article className={clsx(className, 'group/product-card text-left')} {...props}>
      <div className="relative">
        <ProductBadges className="absolute right-2 top-2 z-10 flex gap-2" product={product} />
        <ProductThumbnail isTransitioning={isTransitioning} product={product} />
      </div>

      <h4 className="mt-4 overflow-hidden text-ellipsis text-sm font-bold">{product.title}</h4>
      <p className="mt-1 text-lg font-light">
        <ProductPrice product={product} currencyCode={region.currency_code} />
      </p>
    </article>
  );
};

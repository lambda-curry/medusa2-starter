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

  // Extract product metadata for course-specific information
  const duration = product.metadata?.duration || 'Self-paced';
  const level = product.metadata?.level || 'Beginner';
  const rating = product.metadata?.rating || 4.5;

  return (
    <article
      className={clsx(
        className,
        'group/product-card text-left bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden',
      )}
      {...props}
    >
      <div className="relative">
        <ProductBadges className="absolute right-2 top-2 z-10 flex gap-2" product={product} />
        <ProductThumbnail isTransitioning={isTransitioning} product={product} />

        {/* Course level indicator */}
        <div className="absolute bottom-2 left-2 bg-primary-600/80 text-white text-xs px-2 py-1 rounded-md">
          {level}
        </div>
      </div>

      <div className="p-4">
        {/* Course title */}
        <h4 className="font-inter font-bold text-base text-gray-800 line-clamp-2 min-h-[3rem]">{product.title}</h4>

        {/* Course metadata */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span className="flex items-center">
            <span className="mr-1">⏱️</span> {duration}
          </span>

          <span className="flex items-center">
            <span className="mr-1 text-yellow-500">★</span> {rating}
          </span>
        </div>

        {/* Price with accent background */}
        <div className="mt-3 flex justify-between items-center">
          <p className="text-lg font-bold text-primary-700">
            <ProductPrice product={product} currencyCode={region.currency_code} />
          </p>

          <button className="bg-accent-600 hover:bg-accent-700 text-white text-xs py-1 px-3 rounded-full transition-colors">
            Enroll
          </button>
        </div>
      </div>
    </article>
  );
};

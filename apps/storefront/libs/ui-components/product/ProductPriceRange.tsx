import { type FC, useMemo } from 'react';
import { formatPrice, getVariantPrice, sortProductVariantsByPrice } from '@marketplace/util/prices';
import { ProductVariantPrice } from './ProductVariantPrice';
import { PricedProduct } from '@marketplace/util/medusa';

export interface ProductPriceRangeProps {
  product: PricedProduct;
  currencyCode: string;
}

export const ProductPriceRange: FC<ProductPriceRangeProps> = ({ product, currencyCode }) => {
  const sortedVariants = useMemo(() => sortProductVariantsByPrice(product, currencyCode), [product, currencyCode]);

  const minVariant = sortedVariants[0];
  const maxVariant = sortedVariants[sortedVariants.length - 1];

  const minPrice = useMemo(() => getVariantPrice(minVariant, currencyCode), [sortedVariants, currencyCode]);
  const maxPrice = useMemo(() => getVariantPrice(maxVariant, currencyCode), [sortedVariants, currencyCode]);

  const hasPriceRange = minPrice !== maxPrice;

  return (
    <>
      {hasPriceRange ? (
        <>
          {formatPrice(minPrice, { currency: currencyCode })}
          {maxPrice && maxPrice > minPrice ? <>&ndash;{formatPrice(maxPrice, { currency: currencyCode })}</> : ''}
        </>
      ) : (
        <ProductVariantPrice variant={minVariant} currencyCode={currencyCode} />
      )}
    </>
  );
};

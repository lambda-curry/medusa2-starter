import { type FC, useMemo } from 'react';

import { getCheapestProductVariant } from '@libs/util/prices';
import { ProductVariantPrice } from './ProductVariantPrice';
import { StoreProduct, StoreProductVariant } from '@medusajs/types';

export interface ProductPriceProps {
  product: StoreProduct;
  variant?: StoreProductVariant;
  currencyCode: string;
}

export const ProductPrice: FC<ProductPriceProps> = ({ product, currencyCode, ...props }) => {
  const variant = useMemo(
    () => props.variant || getCheapestProductVariant(product),
    [props.variant, product, currencyCode],
  );

  if (!variant) return null;

  return <ProductVariantPrice variant={variant} currencyCode={currencyCode} />;
};

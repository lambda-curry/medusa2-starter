import { type FC, useMemo } from 'react';

import { getCheapestProductVariant } from '@libs/util/prices';
import { ProductVariantPrice } from './ProductVariantPrice';
import { PricedProduct, PricedVariant } from '@libs/util/medusa';

export interface ProductPriceProps {
  product: PricedProduct;
  variant?: PricedVariant;
  currencyCode: string;
}

export const ProductPrice: FC<ProductPriceProps> = ({ product, currencyCode, ...props }) => {
  const variant = useMemo(
    () => props.variant || getCheapestProductVariant(product, currencyCode),
    [props.variant, product, currencyCode]
  );

  if (!variant) return null;

  return <ProductVariantPrice variant={variant} currencyCode={currencyCode} />;
};

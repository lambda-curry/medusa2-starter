import { PricedVariant } from '@marketplace/util/medusa';
import { formatPrice, getVariantPrices } from '@marketplace/util/prices';
import isNumber from 'lodash/isNumber';
import { useMemo, type FC } from 'react';

export interface ProductVariantPriceProps {
  variant: PricedVariant;
  currencyCode: string;
}

export const ProductVariantPrice: FC<ProductVariantPriceProps> = ({ variant, currencyCode }) => {
  const prices = useMemo(() => getVariantPrices(variant, currencyCode), [variant, currencyCode]);
  const { original, calculated } = prices;
  const hasSale = isNumber(calculated) && calculated < original;

  return (
    <>
      {hasSale ? (
        <span className="inline-flex items-center gap-1">
          <span>{formatPrice(calculated, { currency: currencyCode })}</span>
          <s className="text-gray-400">{formatPrice(original, { currency: currencyCode })}</s>
        </span>
      ) : (
        formatPrice(original, { currency: currencyCode })
      )}
    </>
  );
};

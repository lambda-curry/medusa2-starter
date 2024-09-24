import { useMemo } from 'react';
import { ProductWithReviews, getVariantPrices, sortProductVariantsByPrice } from '../../util';
import { useRegion } from './useRegion';

export const useProductPriceDetails = (product: ProductWithReviews) => {
  const { region } = useRegion();
  const currencyCode = region.currency_code;

  const sortedVariants = useMemo(() => {
    return sortProductVariantsByPrice(product, currencyCode);
  }, [product.variants, currencyCode]);

  const lowestPricedVariant = sortedVariants[0];
  const highestPricedVariant = sortedVariants[sortedVariants.length - 1];

  const variantPrices = useMemo(() => {
    return sortedVariants.map(variant => {
      return getVariantPrices(variant, currencyCode);
    });
  }, [sortedVariants, currencyCode]);

  const hasSale = useMemo(() => {
    return variantPrices.some(variantPrice => {
      if (!variantPrice.calculated) return false;
      return variantPrice.calculated < variantPrice.original;
    });
  }, [variantPrices]);

  const earliestSaleEnds = useMemo(() => {
    if (!hasSale) return null;
    const variantsWithSaleEndDates = variantPrices
      .filter(variantPrice => variantPrice.price_list?.ends_at)
      .sort((a, b) => {
        if (!a.price_list?.ends_at || !b.price_list?.ends_at) return 0;
        return new Date(a.price_list.ends_at).getTime() - new Date(b.price_list.ends_at).getTime();
      });

    if (variantsWithSaleEndDates.length === 0 || !variantsWithSaleEndDates[0].price_list?.ends_at) return null;
    return new Date(variantsWithSaleEndDates[0].price_list.ends_at);
  }, []);

  return {
    lowestPricedVariant,
    lowestPrices: variantPrices[0],
    highestPricedVariant,
    highestPrices: variantPrices[variantPrices.length - 1],
    hasSale,
    earliestSaleEnds
  };
};

import { useMemo } from 'react'
import { getVariantPrices, sortProductVariantsByPrice } from '../../util'
import { useRegion } from './useRegion'
import { StoreProduct } from '@medusajs/types'

export const useProductPriceDetails = (product: StoreProduct) => {
  const { region } = useRegion()
  const currencyCode = region.currency_code

  const sortedVariants = useMemo(() => {
    return sortProductVariantsByPrice(product)
  }, [product.variants, currencyCode])

  const lowestPricedVariant = sortedVariants[0]
  const highestPricedVariant = sortedVariants[sortedVariants.length - 1]

  const variantPrices = useMemo(() => {
    return sortedVariants.map((variant) => {
      return getVariantPrices(variant)
    })
  }, [sortedVariants, currencyCode])

  return {
    lowestPricedVariant,
    lowestPrices: variantPrices[0],
    highestPricedVariant,
    highestPrices: variantPrices[variantPrices.length - 1],
  }
}

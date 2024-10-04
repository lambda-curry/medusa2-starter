import type {} from "@remix-run/node"
import merge from "lodash/merge"
import isNumber from "lodash/isNumber"
import {
  StoreCart,
  StoreCartLineItem,
  StoreProduct,
  StoreProductVariant,
} from "@medusajs/types"
import { BaseCalculatedPriceSet } from "@medusajs/types/dist/http/pricing/common"

const locale = "en-US"

export interface FormatPriceOptions {
  currency: Intl.NumberFormatOptions["currency"]
  quantity?: number
}

export function formatPrice(
  amount: number | null,
  options: FormatPriceOptions,
) {
  const defaultOptions = {
    currency: "usd",
    quantity: 1,
  }
  const { currency, quantity } = merge({}, defaultOptions, options)

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(((amount || 0) / 100) * quantity)
}

export function sortProductVariantsByPrice(product: StoreProduct) {
  if (!product.variants) return []
  return product.variants.sort(
    (a, b) => getVariantFinalPrice(a) - getVariantFinalPrice(b),
  )
}

export function getVariantPrices(variant: StoreProductVariant) {
  return {
    calculated: variant.calculated_price?.calculated_amount,
    original: variant.calculated_price?.original_amount,
  }
}

export function getVariantFinalPrice(variant: StoreProductVariant) {
  const { calculated, original } = getVariantPrices(variant)

  return (isNumber(calculated) ? calculated : original) as number
}

export function getCheapestProductVariant(product: StoreProduct) {
  return sortProductVariantsByPrice(product)[0]
}

export function getMostExpensiveProductVariant(
  product: StoreProduct,
  currencyCode: string,
) {
  const variants = sortProductVariantsByPrice(product)
  return variants[variants.length - 1]
}

export function getMinimumProductPriceValue(
  product: StoreProduct,
  currencyCode: string,
) {
  return getVariantFinalPrice(getCheapestProductVariant(product))
}

export function formatLineItemPrice(
  lineItem: StoreCartLineItem,
  regionCurrency: string,
) {
  return formatPrice(lineItem.unit_price, {
    currency: regionCurrency,
    quantity: lineItem.quantity,
  })
}

export function formatCartSubtotal(cart: StoreCart) {
  return formatPrice(cart.subtotal || 0, {
    currency: cart.region?.currency_code,
  })
}

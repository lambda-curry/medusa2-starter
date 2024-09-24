import type {} from '@remix-run/node';
import merge from 'lodash/merge';
import isNumber from 'lodash/isNumber';
import { Cart, LineItem, PricedProduct, PricedVariant } from './medusa';

const locale = 'en-US';

export interface FormatPriceOptions {
  currency: Intl.NumberFormatOptions['currency'];
  quantity?: number;
}

export function formatPrice(amount: number | null, options: FormatPriceOptions) {
  const defaultOptions = {
    currency: 'usd',
    quantity: 1
  };
  const { currency, quantity } = merge({}, defaultOptions, options);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(((amount || 0) / 100) * quantity);
}

export function sortProductVariantsByPrice(product: PricedProduct, currencyCode: string) {
  if (!product.variants) return [];
  return product.variants.sort((a, b) => getVariantPrice(a, currencyCode) - getVariantPrice(b, currencyCode));
}

export function getVariantPrice(variant: PricedVariant, currencyCode: string) {
  const { calculated, original } = getVariantPrices(variant, currencyCode);
  return isNumber(calculated) ? calculated : original;
}

export function getVariantPrices(variant: PricedVariant, currencyCode: string) {
  const price = variant
    .prices!.filter(price => price.currency_code === currencyCode)
    .sort((a, b) => a.amount - b.amount)[0];

  return {
    ...price,
    original: variant.original_price || price?.amount || 0,
    calculated: variant.calculated_price
  };
}

export function variantSaleEndDate(variant: PricedVariant, currencyCode: string) {
  const { price_list } = getVariantPrices(variant, currencyCode);
  return price_list?.ends_at ? new Date(price_list.ends_at) : null;
}

export function getCheapestProductVariant(product: PricedProduct, currencyCode: string) {
  return sortProductVariantsByPrice(product, currencyCode)[0];
}

export function getMostExpensiveProductVariant(product: PricedProduct, currencyCode: string) {
  const variants = sortProductVariantsByPrice(product, currencyCode);
  return variants[variants.length - 1];
}

export function getMinimumProductPriceValue(product: PricedProduct, currencyCode: string) {
  return getVariantPrice(getCheapestProductVariant(product, currencyCode), currencyCode);
}

export function formatLineItemPrice(lineItem: LineItem, regionCurrency: string) {
  return formatPrice(lineItem.unit_price, { currency: regionCurrency, quantity: lineItem.quantity });
}

export function formatCartSubtotal(cart: Cart) {
  return formatPrice(cart.subtotal || 0, { currency: cart.region?.currency_code });
}

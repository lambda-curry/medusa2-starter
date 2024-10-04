import { getMinimumProductPriceValue } from '../prices';
import { type GA4ItemParams } from './types';
import { Cart, LineItem, Order, PricedProduct } from '../medusa';

export const selectValueFromCart = (cart?: Cart) => (cart?.total ? cart.total / 100 : undefined);

export const selectValueFromOrder = (order?: Order) => (order?.total ? order.total / 100 : undefined);

export const getUpdatedCartValue = (updatedCart: Cart | Cart, previousCart: Cart | Cart) => {
  return typeof updatedCart.total === 'number' && typeof previousCart.total === 'number'
    ? (updatedCart.total - previousCart.total) / 100
    : undefined;
};

export const lineItemMap = (item: LineItem) => ({
  item_id: item.variant?.product?.id,
  item_name: item.variant?.product?.title,
  item_category: item.variant?.product?.collection_id || undefined,
  item_list_name: 'Cart',
  item_list_id: 'Cart',
  discount: item?.discount_total ? item.discount_total / 100 : undefined,
  price: item?.total ? item.total / 100 : undefined,
  quantity: item.quantity
});

export const getItemsFromProduct: (product: PricedProduct, regionCurrency: string) => GA4ItemParams[] = (
  product,
  regionCurrency
) => {
  return [product].map(item => ({
    item_id: item.id || '',
    item_name: item.title || '',
    item_category: item.collection_id || undefined,
    price: getMinimumProductPriceValue(product, regionCurrency) / 100
  }));
};

export const getAddedCartItems: (updatedCart: Cart, previousCart: Cart) => GA4ItemParams[] = (
  updatedCart,
  previousCart
) => {
  return (
    updatedCart.items
      ?.filter(item => !previousCart.items?.some(prevItem => prevItem.created_at === item.created_at))
      .map(lineItemMap) ?? []
  );
};

export const getRemovedCartItems: (updatedCart: Cart, previousCart: Cart) => GA4ItemParams[] = (
  updatedCart,
  previousCart
) => {
  if (!previousCart.items || !updatedCart.items) return [];

  return previousCart.items
    .filter(item => !updatedCart.items?.some(prevItem => prevItem.created_at === item.created_at))
    .map(lineItemMap);
};

// export const identifySegmentUser = async (customer: OmitPartial<Customer>, 'password_hash'>>) => {
//   if (!isSegmentLoaded()) return;

//   return window.segmentAnalytics.identify(customer.id || customer.email, {
//     email: customer.email,
//     firstName: customer.first_name || '',
//     lastName: customer.last_name || ''
//   });
// };

export const selectCheckoutDataFromCart = (cart: Cart) => ({
  value: selectValueFromCart(cart) as number,
  currency: cart?.region!.currency_code,
  items: cart?.items!.map(lineItemMap),
  coupon: cart?.discounts?.map(dc => dc.code).join(',')
});

export const selectCheckoutDataFromOrder = (order: Order) => ({
  value: selectValueFromOrder(order) as number,
  currency: order.currency_code,
  items: order.items!.map(lineItemMap),
  coupon: order.discounts?.map(dc => dc.code).join(',')
});

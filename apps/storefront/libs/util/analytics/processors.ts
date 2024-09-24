import { type EventInputData, type DispatchEvent } from './events';
import { type GA4ItemParams, type ShareContentMethods } from './types';
import {
  getAddedCartItems,
  getItemsFromProduct,
  getRemovedCartItems,
  getUpdatedCartValue,
  lineItemMap,
  selectCheckoutDataFromCart,
  selectValueFromCart
} from './helpers';
import { getMinimumProductPriceValue } from '../prices';
import { selectCheckoutDataFromOrder } from './helpers';
import { PricedProduct } from '../medusa';

export type EventProcessor<
  EventName extends keyof EventInputData = keyof EventInputData,
  ProcessedData = EventInputData[keyof EventInputData]
> = (
  eventName: EventName,
  dispatch: DispatchEvent<EventName, ProcessedData>,
  data: EventInputData[EventName]
) => ReturnType<DispatchEvent<EventName, ProcessedData>>;

export const defaultProcessor = <EventName extends keyof EventInputData>(
  event: EventName,
  dispatch: DispatchEvent<EventName, EventInputData[EventName]>,
  data: EventInputData[EventName]
) => dispatch(event, data);
interface ProcessedShareData extends ShareData {
  method: ShareContentMethods;
}
export const gaShareProcessor: EventProcessor<'share', ProcessedShareData> = (
  eventName,
  dispatch,
  { method, url, title, text }
) =>
  dispatch(eventName, {
    method,
    url,
    title,
    text
  });

export const gaViewItemProcessor: EventProcessor<
  'view_item',
  { currency: string; value: number; items: GA4ItemParams[] }
> = (eventName, dispatch, { product, currencyCode }) => {
  return dispatch(eventName, {
    currency: currencyCode,
    value: getMinimumProductPriceValue(product as PricedProduct, currencyCode) / 100,
    items: getItemsFromProduct(product as PricedProduct, currencyCode)
  });
};

export const gaViewCartProcessor: EventProcessor<
  'view_cart',
  { currency: string; value: number | undefined; items: GA4ItemParams[] }
> = (eventName, dispatch, { cart }) => {
  return dispatch(eventName, {
    currency: cart.region!.currency_code,
    value: selectValueFromCart(cart),
    items: cart.items!.map(lineItemMap)
  });
};

export const gaAddCartItemsProcessor: EventProcessor<
  'add_to_cart',
  { currency: string; value: number | undefined; items: GA4ItemParams[] }
> = (eventName, dispatch, { updatedCart, previousCart }) =>
  dispatch(eventName, {
    currency: updatedCart.region!.currency_code,
    value: getUpdatedCartValue(updatedCart, previousCart),
    items: getAddedCartItems(updatedCart, previousCart)
  });

export const gaRemoveCartItemsProcessor: EventProcessor<
  'remove_from_cart',
  { currency: string; value: number | undefined; items: GA4ItemParams[] }
> = (eventName, dispatch, { updatedCart, previousCart }) =>
  dispatch(eventName, {
    currency: updatedCart.region!.currency_code,
    value: getUpdatedCartValue(updatedCart, previousCart),
    items: getRemovedCartItems(updatedCart, previousCart)
  });

// export const segmentSubscribeProcessor: EventProcessor<
//   'subscribe',
//   {
//     email: string;
//     firstName?: string;
//     lastName?: string;
//     listId: KlaviyoListId;
//   }
// > = async (eventName, dispatch, { email, customer }) => {
//   await identifySegmentUser({ email, ...customer });

//   return dispatch(eventName, {
//     email: email || customer?.email || '',
//     firstName: customer?.first_name || '',
//     lastName: customer?.last_name || '',
//     listId: KlaviyoListId.AshleyCanadaNewsletter,
//   });
// };

export const gaPurchaseProcessor: EventProcessor<
  'purchase',
  { currency: string; value: number; items: GA4ItemParams[]; coupon?: string }
> = (eventName, dispatch, { order }) => dispatch(eventName, selectCheckoutDataFromOrder(order));

export const gaBeginCheckoutProcessor: EventProcessor<
  'begin_checkout',
  { currency: string; value: number; items: GA4ItemParams[]; coupon?: string }
> = (eventName, dispatch, { cart }) => dispatch(eventName, selectCheckoutDataFromCart(cart));

export const gaAddShippingInfoProcessor: EventProcessor<
  'add_shipping_info',
  { currency: string; value: number; items: GA4ItemParams[]; coupon?: string; shipping_tier: string }
> = (eventName, dispatch, { cart }) =>
  dispatch(eventName, {
    ...selectCheckoutDataFromCart(cart),
    shipping_tier: cart?.shipping_methods!.map(shippingMethod => shippingMethod?.shipping_option?.name).join(',')
  });

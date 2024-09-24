import { Cart, Order, PricedProduct, Product } from '../medusa/types';
import {
  gaAddCartItemsProcessor,
  gaAddShippingInfoProcessor,
  gaBeginCheckoutProcessor,
  gaPurchaseProcessor,
  gaRemoveCartItemsProcessor,
  gaShareProcessor,
  gaViewCartProcessor,
  gaViewItemProcessor,
  type EventProcessor
} from './processors';
import { type ShareContentMethods, type SignUpMethods } from './types';

export type AnalyticsConsumer = 'ga';
export type DispatchEvent<
  EventName extends keyof EventInputData = keyof EventInputData,
  ProcessedData = EventInputData[EventName]
> = (action: EventName, data: ProcessedData) => Promise<ProcessedData>;
export type AnalyticsEventName = keyof EventInputData;

export type AnalyticsEventRegistry = {
  [EventName in AnalyticsEventName]: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Consumer in AnalyticsConsumer]?: EventProcessor<EventName, any> | boolean;
  };
};
export type UseSendEvent<K extends keyof EventInputData> = (eventName: K) => (data: EventInputData[K]) => void;

export interface EventInputData {
  sign_up: { method: SignUpMethods; email: string };
  login: { method: string };
  share: { method: ShareContentMethods } & ShareData;
  view_item: { product: Product | PricedProduct; currencyCode: string };
  view_cart: { cart: Cart };
  add_to_cart: { updatedCart: Cart; previousCart: Cart };
  remove_from_cart: { updatedCart: Cart; previousCart: Cart };
  purchase: { order: Order };
  begin_checkout: { cart: Cart };
  add_shipping_info: { cart: Cart };
}
export const events: AnalyticsEventRegistry = {
  sign_up: { ga: true },
  login: { ga: true },
  share: { ga: gaShareProcessor },
  view_item: { ga: gaViewItemProcessor },
  view_cart: { ga: gaViewCartProcessor },
  add_to_cart: { ga: gaAddCartItemsProcessor },
  remove_from_cart: { ga: gaRemoveCartItemsProcessor },
  purchase: { ga: gaPurchaseProcessor },
  begin_checkout: { ga: gaBeginCheckoutProcessor },
  add_shipping_info: { ga: gaAddShippingInfoProcessor }
};

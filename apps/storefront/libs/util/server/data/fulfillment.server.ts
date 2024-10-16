import { sdk } from '@libs/util/server/client.server';
import { StoreCartShippingOption } from '@medusajs/types';

export const listCartShippingOptions = async (cartId: string) => {
  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId })
    .then(({ shipping_options }) => shipping_options)
    .catch(() => [] as StoreCartShippingOption[]);
};

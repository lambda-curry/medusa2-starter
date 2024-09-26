import { sdk } from "@libs/util/server/client.server"

// Shipping actions
export const listCartShippingMethods = async (cartId: string) => {
  return sdk.store.fulfillment
    .listCartOptions({ cart_id: cartId })
    .then(({ shipping_options }) => shipping_options)
    .catch(() => null)
}

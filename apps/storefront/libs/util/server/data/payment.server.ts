import { sdk } from "@libs/util/server/client.server"

// Payment actions
export const listCartPaymentMethods = async (regionId: string) => {
  return sdk.store.payment
    .listPaymentProviders({ region_id: regionId })
    .then(({ payment_providers }) => payment_providers)
    .catch(() => null)
}

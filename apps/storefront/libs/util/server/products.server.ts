import { sdk } from "@libs/util/server/client.server"
import { HttpTypes } from "@medusajs/types"
import { getCartSession } from "./cart-session.server"

export const fetchProducts = async (
  request: Request,
  { currency_code, ...query }: HttpTypes.StoreProductParams = {},
) => {
  const { regionId, currencyCode } = await getCartSession(request.headers)
  console.log("🚀 ~ query:", query)
  console.log("🚀 ~ regionId, currencyCode:", regionId, currencyCode)

  return await sdk.store.product
    .list({
      ...query,
      region_id: regionId,
      // currency_code: currency_code ?? currencyCode, // TODO: CHECK IF THIS IS AVAILABLE AFTER V2 RELEASE
    })
    .catch((error) => {
      console.error("🚀 ~ fetchProducts ~ error:", error)

      throw error
    })
}

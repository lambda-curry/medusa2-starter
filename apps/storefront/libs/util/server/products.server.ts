import { createMedusaClient } from "@libs/util/server/client.server"
import { StoreGetProductsParams } from "@markethaus/storefront-client"
import { getCartSession } from "./cart-session.server"

export const fetchProducts = async (
  request: Request,
  query?: StoreGetProductsParams,
) => {
  const client = await createMedusaClient({ request })
  const { regionId, currencyCode } = await getCartSession(request.headers)

  return await client.products.list({
    ...query,
    region_id: regionId,
    currency_code: currencyCode,
  })
}

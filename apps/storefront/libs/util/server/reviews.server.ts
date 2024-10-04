import { LoaderFunctionArgs } from "@remix-run/node"
import { withPaginationParams } from "../remix/withPaginationParams"
import { PageType, ProductWithReviews } from ".."
import { sdk } from "@libs/util/server/client.server"
import { getCartSession } from "./cart-session.server"
import { HttpTypes } from "@medusajs/types"

export const getProduct = async ({ request, params }: LoaderFunctionArgs) => {
  const { regionId: region_id, currencyCode: currency_code } =
    await getCartSession(request.headers)

  const { products } = await sdk.store.product.list({
    handle: params.productHandle,
    region_id,
    currency_code,
    // include_category_children: true, // TODO: CHECK IF THIS IS POSSIBLE AFTER V2 RELEASE
  })

  const product = products[0]

  if (!product) return null

  return product
}

export const getProductsList = async (
  request: Request,
  query: HttpTypes.StoreProductParams,
) => {
  const { limit, offset } = withPaginationParams({ request })
  const { regionId: region_id, currencyCode: currency_code } =
    await getCartSession(request.headers)

  if (limit) query.limit = limit
  if (offset) query.offset = offset

  return await sdk.store.product.list({
    ...query,
    region_id,
    currency_code,
    // include_category_children: true, // TODO: CHECK IF THIS IS POSSIBLE AFTER V2 RELEASE
  })
}

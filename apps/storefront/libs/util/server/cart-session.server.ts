import { createCookie } from "@remix-run/node"
import { destroyCookie, getCookie, setCookie } from "./cookies.server"
import { sdk } from "@libs/util/server/client.server"

export type CartSessionData = {
  cartId: string
  regionId: string
  currencyCode: string
}

export const cartIdCookie = createCookie("cart-id")
export const regionIdCookie = createCookie("region-id")
export const currencyCodeCookie = createCookie("currency-code")

export const getCartSession = async (
  headers: Headers,
): Promise<Partial<CartSessionData>> => {
  // const client = await createMedusaClient({ request: { headers } });

  const cartId = await getCookie(headers, cartIdCookie)
  const regionId = await getCookie(headers, regionIdCookie)
  const currencyCode = await getCookie(headers, currencyCodeCookie)

  // Use the default region as a fallback if we don't already have a regionId.
  const region = !regionId
    ? (await sdk.store.region.list({}))["regions"][0]
    : null

  return {
    cartId,
    regionId: regionId || region?.id,
    // currencyCode: currencyCode || region?.currency_code,
    currencyCode: "eur",
  }
}

export const createCartSession = async (
  headers: Headers,
  createData: CartSessionData,
) => {
  // We need to get the cookies directly here to avoid falling back to the
  // default region form `getCartSession` when initializing the cart session.
  const cartId = await getCookie(headers, cartIdCookie)
  const regionId = await getCookie(headers, regionIdCookie)
  const currencyCode = await getCookie(headers, currencyCodeCookie)

  if (createData.cartId !== cartId)
    await setCookie(headers, cartIdCookie, createData.cartId)
  if (createData.regionId !== regionId)
    await setCookie(headers, regionIdCookie, createData.regionId)
  if (createData.currencyCode !== currencyCode)
    await setCookie(headers, currencyCodeCookie, createData.currencyCode)

  return getCartSession(headers)
}

export const destroyCartSession = async (headers: Headers) => {
  await destroyCookie(headers, cartIdCookie)
  await destroyCookie(headers, regionIdCookie)
  await destroyCookie(headers, currencyCodeCookie)
}

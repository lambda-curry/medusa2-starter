import { getCartSession } from "./cart-session.server"
import { Customer } from "@medusajs/medusa"
import { createCookie } from "@remix-run/node"
import { getCookie, setCookie } from "./cookies.server"
import jwt from "jsonwebtoken"
import { config } from "./config.server"
import { sdk } from "./client.server"

export const authCookie = createCookie(config.AUTH_COOKIE_NAME)

// export const authenticateCustomer = async (
//   data: { email: string; password: string },
//   request: Request,
// ): Promise<{ customer_id: Customer["id"]; headers: Headers }> => {
//   const { email, password } = data

//   try {
//     const clientHeaders = new Headers()
//     const serverHeaders = new Headers(request.headers)

//     const access_token = await sdk.auth.login("customer", "password", {
//       email,
//       password,
//     })

//     if (!access_token)
//       throw Error("No access token received from authentication")

//     const decoded = jwt.decode(access_token as string) as unknown as {
//       customer_id: string
//     }

//     const customer_id = decoded.customer_id

//     const cartSession = await getCartSession(request.headers)

//     setCookie(clientHeaders, authCookie, access_token as string)

//     if (cartSession.cartId)
//       await sdk.store.cart.update(cartSession.cartId, { customer_id })

//     // Create a new client with the updated headers for immediate authentication on the server.
//     const newClient = await createMedusaClient({
//       request: { headers: serverHeaders },
//     })

//     return { customer_id, headers: clientHeaders, client: newClient }
//   } catch (error: any) {
//     throw error
//   }
// }

type AuthHeaders = { authorization: string } | {}

export const getAuthHeaders = async (
  request: Partial<Request>,
): Promise<AuthHeaders> => {
  if (!request.headers) {
    throw Error("No request provided for getting auth headers")
  }

  const token = await getCookie(request.headers, authCookie)

  if (!token) {
    return {}
  }

  return { authorization: `Bearer ${token}` }
}

export const withAuthHeaders = <
  TArgs extends Array<any> = any[],
  TReturn = any,
>(
  asyncFn: (
    request: Request,
    authHeaders: AuthHeaders,
    ...args: TArgs
  ) => TReturn,
) => {
  return async (
    request: Request,
    ...args: TArgs
  ): Promise<Awaited<TReturn>> => {
    const authHeaders = await getAuthHeaders(request)

    return await asyncFn(request, authHeaders, ...args)
  }
}

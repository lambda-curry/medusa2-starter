import { sdk } from "@libs/util/server/client.server"
import { HttpTypes } from "@medusajs/types"
import { withAuthHeaders } from "../auth.server"
import { medusaError } from "@libs/util/medusa/medusa-error"
import { removeAuthToken, setAuthToken } from "../cookies.server"
import { redirect } from "@remix-run/node"

export const getCustomer = withAuthHeaders(async (request, authHeaders) => {
  return await sdk.store.customer
    .retrieve({}, authHeaders)
    .then(({ customer }) => customer)
    .catch(() => null)
})

export const updateCustomer = withAuthHeaders(
  async (request, authHeaders, body: HttpTypes.StoreUpdateCustomer) => {
    const updateRes = await sdk.store.customer
      .update(body, {}, authHeaders)
      .then(({ customer }) => customer)
      .catch(medusaError)

    return updateRes
  },
)

export async function signup(
  request: Request,
  _currentState: unknown,
  formData: FormData,
) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    const customHeaders = { authorization: `Bearer ${token}` }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      customHeaders,
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(request.headers, loginToken as string)

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(
  request: Request,
  _currentState: unknown,
  formData: FormData,
) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(request.headers, token as string)
      })
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(request: Request, countryCode: string) {
  await sdk.auth.logout()
  await removeAuthToken(request.headers)

  redirect(`/${countryCode}/account`)
}

export const addCustomerAddress = withAuthHeaders(
  async (
    request,
    authHeaders,
    _currentState: unknown,
    formData: FormData,
  ): Promise<any> => {
    const address = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      company: formData.get("company") as string,
      address_1: formData.get("address_1") as string,
      address_2: formData.get("address_2") as string,
      city: formData.get("city") as string,
      postal_code: formData.get("postal_code") as string,
      province: formData.get("province") as string,
      country_code: formData.get("country_code") as string,
      phone: formData.get("phone") as string,
    }

    return sdk.store.customer
      .createAddress(address, {}, authHeaders)
      .then(({ customer }) => ({ success: true, error: null }))
      .catch((err) => {
        return { success: false, error: err.toString() }
      })
  },
)

export const deleteCustomerAddress = withAuthHeaders(
  async (
    request,
    authHeaders,
    addressId: string,
  ): Promise<{ success: boolean; error: string | null }> => {
    return await sdk.store.customer
      .deleteAddress(addressId, authHeaders)
      .then(() => ({ success: true, error: null }))
      .catch((err) => ({ success: false, error: err.toString() }))
  },
)

export const updateCustomerAddress = withAuthHeaders(
  async (
    request,
    authHeaders,
    currentState: Record<string, unknown>,
    formData: FormData,
  ) => {
    const addressId = currentState.addressId as string

    const address = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      company: formData.get("company") as string,
      address_1: formData.get("address_1") as string,
      address_2: formData.get("address_2") as string,
      city: formData.get("city") as string,
      postal_code: formData.get("postal_code") as string,
      province: formData.get("province") as string,
      country_code: formData.get("country_code") as string,
      phone: formData.get("phone") as string,
    }

    return sdk.store.customer
      .updateAddress(addressId, address, {}, authHeaders)
      .then(() => ({ success: true, error: null }))
      .catch((err) => ({ success: false, error: err.toString() }))
  },
)

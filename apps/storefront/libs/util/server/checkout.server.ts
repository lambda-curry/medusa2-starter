import {
  StoreCartsRes,
  AddressPayload,
  AddressCreatePayload,
} from "@markethaus/storefront-client"
import { addressToMedusaAddress } from "@utils/addresses"
import { FormValidationError } from "@utils/validation/validation-error"
import { ActionFunctionArgs, json, TypedResponse } from "@remix-run/node"
import { UpdateAccountDetailsInput } from "~/routes/_todo/api.checkout"
import { createMedusaClient } from "./client.server"
import { authenticateCustomer } from "./auth.server"
import { validateAddress } from "@utils/validation/address-validation"
import { validationError } from "remix-validated-form"
import { prefixKeys } from "../prefix-keys"
import { suggestAddress } from "../address-suggestion"
import {
  checkoutAccountDetailsValidator,
  expressCheckoutAccountDetailsValidator,
} from "~/components/checkout"

export const _updateAccountDetails = async (
  data: UpdateAccountDetailsInput,
  actionArgs: ActionFunctionArgs,
): Promise<{ cart: StoreCartsRes["cart"]; headers?: Headers }> => {
  const isLoggedIn = !!data.customerId

  const result = data.isExpressCheckout
    ? await expressCheckoutAccountDetailsValidator.validate(data)
    : await checkoutAccountDetailsValidator.validate(data)

  if (result.error) throw new FormValidationError(result.error)

  if (!isLoggedIn) return await updateGuestAccountDetails(data, actionArgs)

  return await updateGuestAccountDetails(data, actionArgs)
}

export const validateAndSuggestShippingAddress = async (
  data: UpdateAccountDetailsInput,
): Promise<
  | { response: TypedResponse<any>; data?: undefined }
  | { response?: undefined; data: UpdateAccountDetailsInput }
> => {
  if (data.shippingAddressId !== "new" && !data.isExpressCheckout)
    return { data }

  let {
    invalid: addressInvalid,
    address: shippingAddress,
    errors,
  } = await validateAddress(data.shippingAddress)
  if (addressInvalid)
    return {
      response: validationError({
        fieldErrors: prefixKeys(errors ?? {}, "shippingAddress."),
      }),
    }

  if (data.allowSuggestions) {
    const suggestion = await suggestAddress(shippingAddress)

    if (suggestion.prompt)
      return {
        response: json({
          suggestions: {
            original: data.shippingAddress,
            suggested: suggestion.address,
            originalPayload: data,
            suggestedPayload: { ...data, shippingAddress: suggestion.address },
          },
        }),
      }
    shippingAddress = { ...shippingAddress, ...suggestion.address }
  }

  return { data: { ...data, shippingAddress } }
}

export const updateGuestAccountDetails = async (
  data: UpdateAccountDetailsInput,
  actionArgs: ActionFunctionArgs,
): Promise<{ cart: StoreCartsRes["cart"]; headers?: Headers }> => {
  const { request } = actionArgs
  const client = await createMedusaClient(actionArgs)

  const addressResult = await validateAndSuggestShippingAddress(data)
  if (addressResult.response) throw addressResult.response
  data = addressResult.data

  const formattedShippingAddress = addressToMedusaAddress(data.shippingAddress)

  const { cart } = await client.carts.update(data.cartId, {
    email: data.email,
    shipping_address: formattedShippingAddress as AddressPayload,
    billing_address: formattedShippingAddress as AddressPayload,
  })

  if (data.password) {
    // Create new customer
    const createCustomerRes = await client.customers.create({
      email: data.email,
      password: data.password,
      first_name: data.shippingAddress.firstName,
      last_name: data.shippingAddress.lastName,
    })

    try {
      const {
        customer_id,
        headers,
        client: newClient,
      } = await authenticateCustomer(
        { email: data.email, password: data.password },
        client,
        request,
      )

      // Add address to customer
      const { customer: updatedCustomer } =
        await newClient.customers.addAddress({
          address: formattedShippingAddress as AddressCreatePayload,
        })

      const { cart: updatedCart } = await newClient.carts.update(
        data.cartId,
        {
          customer_id,
          shipping_address: updatedCustomer.shipping_addresses[0].id,
        },
        headers,
      )

      return { cart: updatedCart, headers }
    } catch (error: any) {
      console.error("Error while logging in new customer", error)
      throw new FormValidationError({
        fieldErrors: {
          formError: "There was a problem processing your request.",
        },
      })
    }
  }

  return { cart }
}

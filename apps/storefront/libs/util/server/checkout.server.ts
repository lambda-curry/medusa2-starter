import { addressToMedusaAddress } from "@libs/utils-to-merge/addresses"
import { FormValidationError } from "@libs/utils-to-merge/validation/validation-error"
import { ActionFunctionArgs, json, TypedResponse } from "@remix-run/node"
import { UpdateAccountDetailsInput } from "~/routes/api.checkout"
import { validateAddress } from "@libs/utils-to-merge/validation/address-validation"
import { validationError } from "remix-validated-form"
import { prefixKeys } from "../prefix-keys"
import { suggestAddress } from "../address-suggestion"
import { checkoutAccountDetailsValidator } from "~/components/checkout"
import { StoreCart, StoreCartAddress } from "@medusajs/types"
import { updateCart } from "./data/cart.server"

export const _updateAccountDetails = async (
  data: UpdateAccountDetailsInput,
  actionArgs: ActionFunctionArgs,
): Promise<{ cart: StoreCart; headers?: Headers }> => {
  const result = await checkoutAccountDetailsValidator.validate(data)

  if (result.error) throw new FormValidationError(result.error)

  return await updateGuestAccountDetails(data, actionArgs)
}

export const updateGuestAccountDetails = async (
  data: UpdateAccountDetailsInput,
  actionArgs: ActionFunctionArgs,
): Promise<{ cart: StoreCart; headers?: Headers }> => {
  const { request } = actionArgs

  const formattedShippingAddress = addressToMedusaAddress(
    data.shippingAddress,
  ) as StoreCartAddress

  const { cart } = await updateCart(request, {
    email: data.email,
    shipping_address: formattedShippingAddress,
    billing_address: formattedShippingAddress,
  })

  return { cart }
}

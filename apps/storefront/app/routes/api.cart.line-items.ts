import { FormValidationError } from "@utils/validation/validation-error"
import { V2ActionHandler, handleActionV2 } from "@libs/util/handleAction.server"
import { getVariantBySelectedOptions } from "@libs/util/products"
import { cartIdCookie } from "@libs/util/server/cart-session.server"
import { setCookie } from "@libs/util/server/cookies.server"
import type { ActionFunctionArgs, NodeOnDiskFile } from "@remix-run/node"
import { unstable_data as data } from "@remix-run/node"
import { withYup } from "@remix-validated-form/with-yup"
import * as Yup from "yup"
import { StoreCart, StoreCartResponse } from "@medusajs/types"
import {
  addToCart,
  deleteLineItem,
  retrieveCart,
  updateLineItem,
} from "@libs/util/server/data/cart.server"
import { getProductsById } from "@libs/util/server/data/products.server"

export const addCartItemValidation = withYup(
  Yup.object().shape({
    productId: Yup.string().required(),
    options: Yup.object().default({}),
    quantity: Yup.number().required(),
    customer_product_response: Yup.string(),
    customer_file_uploads: Yup.array().of(Yup.mixed()).optional(),
  }),
)

export enum LineItemActions {
  CREATE = "createItem",
  UPDATE = "updateItem",
  DELETE = "deleteItem",
}

export interface CreateLineItemPayLoad {
  cartId: string
  productId: string
  options: { [key: string]: string }
  quantity: string
  customer_product_response: string
  customer_file_uploads: NodeOnDiskFile[] | []
}

export interface UpdateLineItemRequestPayload {
  cartId: string
  lineItemId: string
  quantity: string
}

export interface DeleteLineItemRequestPayload {
  cartId: string
  lineItemId: string
}

// const uploadImages = async (
//   images: NodeOnDiskFile[] | NodeOnDiskFile | null | undefined,
//   client: Medusa,
// ): Promise<
//   {
//     url: string
//     key: string
//   }[]
// > => {
//   if (!images) return []
//   const imagesToUpload = Array.isArray(images) ? images : [images]
//   if (!imagesToUpload || imagesToUpload.length === 0) return []
//   const uploadResponse = await client.productReviews.uploadImages(
//     imagesToUpload,
//   )
//   if (!uploadResponse) return []
//   const uploads = uploadResponse.uploads

//   return Array.isArray(uploads) ? uploads : [{ ...uploads }]
// }

export interface LineItemRequestResponse extends StoreCartResponse {}

const createItem: V2ActionHandler<StoreCartResponse> = async (
  payload: CreateLineItemPayLoad,
  { request },
) => {
  const result = await addCartItemValidation.validate(payload)

  if (result.error) throw new FormValidationError(result.error)

  let cartId = await cartIdCookie.parse(request.headers.get("Cookie") || "")

  const {
    productId,
    options,
    quantity,
    customer_product_response,
    customer_file_uploads,
  } = payload

  const currentCart = await retrieveCart(request)

  const [product] = await getProductsById({
    ids: [productId],
    regionId: currentCart?.region_id || "US",
  }).catch(() => [])

  if (!product)
    throw new FormValidationError({
      fieldErrors: { formError: "Product not found." },
    })

  const variant = getVariantBySelectedOptions(product.variants || [], options)

  if (!variant)
    throw new FormValidationError({
      fieldErrors: {
        formError:
          "Product variant not found. Please select all required options.",
      },
    })

  const responseHeaders = new Headers()

  const { cart } = await addToCart(request, {
    variantId: variant.id!,
    quantity: parseInt(quantity, 10),
    countryCode: "US",
  })

  await setCookie(responseHeaders, cartIdCookie, cart.id)

  return data({ cart }, { headers: responseHeaders })
}

const updateItem: V2ActionHandler<StoreCartResponse> = async (
  { lineItemId, cartId, quantity }: UpdateLineItemRequestPayload,
  { request },
) => {
  return await updateLineItem(request, {
    lineId: lineItemId,
    quantity: parseInt(quantity, 10),
  })
}

const deleteItem: V2ActionHandler<StoreCartResponse> = async (
  { lineItemId, cartId }: DeleteLineItemRequestPayload,
  { request },
) => {
  await deleteLineItem(request, lineItemId)

  const cart = (await retrieveCart(request)) as StoreCart

  return { cart }
}

const actions = {
  createItem,
  updateItem,
  deleteItem,
}

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleActionV2({
    actionArgs,
    actions,
  })
}

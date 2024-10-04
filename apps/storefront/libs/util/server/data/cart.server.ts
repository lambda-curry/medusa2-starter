import { HttpTypes } from "@medusajs/types"
import omit from "lodash.omit"
import { getCartId, removeCartId, setCartId } from "../cookies.server"
import { getProductsById } from "./products.server"
import { getRegion } from "./regions.server"
import { sdk } from "@libs/util/server/client.server"
import { redirect } from "@remix-run/node"
import { medusaError } from "@libs/util/medusa/medusa-error"
import { withAuthHeaders } from "../auth.server"

export const retrieveCart = withAuthHeaders(async (request, authHeaders) => {
  const cartId = await getCartId(request.headers)

  if (!cartId) {
    return null
  }

  return await sdk.store.cart
    .retrieve(cartId, {}, authHeaders)
    .then(({ cart }) => cart)
    .catch(() => {
      return null
    })
})

export const getOrSetCart = withAuthHeaders(
  async (request, authHeaders, countryCode: string) => {
    let cart = await retrieveCart(request)
    const region = await getRegion(countryCode)

    if (!region) {
      throw new Error(`Region not found for country code: ${countryCode}`)
    }

    if (!cart) {
      const cartResp = await sdk.store.cart.create({ region_id: region.id })
      cart = cartResp.cart
      setCartId(request.headers, cart.id)
    }

    if (cart && cart?.region_id !== region.id) {
      await sdk.store.cart.update(
        cart.id,
        { region_id: region.id },
        {},
        authHeaders,
      )
    }

    return cart
  },
)

export const updateCart = withAuthHeaders(
  async (request, authHeaders, data: HttpTypes.StoreUpdateCart) => {
    const cartId = await getCartId(request.headers)
    if (!cartId) {
      throw new Error(
        "No existing cart found, please create one before updating",
      )
    }

    return sdk.store.cart
      .update(cartId, data, {}, authHeaders)
      .catch(medusaError)
  },
)

export const addToCart = withAuthHeaders(
  async (
    request,
    authHeaders,
    data: {
      variantId: string
      quantity: number
      countryCode: string
    },
  ) => {
    const { variantId, quantity, countryCode } = data

    if (!variantId) {
      throw new Error("Missing variant ID when adding to cart")
    }

    const cart = await getOrSetCart(request, countryCode)
    if (!cart) {
      throw new Error("Error retrieving or creating cart")
    }

    return await sdk.store.cart
      .createLineItem(
        cart.id,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        authHeaders,
      )
      .catch(medusaError)
  },
)

export const updateLineItem = withAuthHeaders(
  async (
    request,
    authHeaders,
    {
      lineId,
      quantity,
    }: {
      lineId: string
      quantity: number
    },
  ) => {
    if (!lineId) {
      throw new Error("Missing lineItem ID when updating line item")
    }

    const cartId = await getCartId(request.headers)
    if (!cartId) {
      throw new Error("Missing cart ID when updating line item")
    }

    return await sdk.store.cart
      .updateLineItem(cartId, lineId, { quantity }, {}, authHeaders)
      .catch(medusaError)
  },
)

export const deleteLineItem = withAuthHeaders(
  async (request, authHeaders, lineId: string) => {
    if (!lineId) {
      throw new Error("Missing lineItem ID when deleting line item")
    }

    const cartId = await getCartId(request.headers)
    if (!cartId) {
      throw new Error("Missing cart ID when deleting line item")
    }

    return await sdk.store.cart
      .deleteLineItem(cartId, lineId, authHeaders)
      .catch(medusaError)
  },
)

export async function enrichLineItems(
  lineItems:
    | HttpTypes.StoreCartLineItem[]
    | HttpTypes.StoreOrderLineItem[]
    | null,
  regionId: string,
) {
  if (!lineItems) return []

  // Prepare query parameters
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.product_id!),
    regionId: regionId,
  }

  // Fetch products by their IDs
  const products = await getProductsById(queryParams)
  // If there are no line items or products, return an empty array
  if (!lineItems?.length || !products) {
    return []
  }

  // Enrich line items with product and variant information
  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p: any) => p.id === item.product_id)
    const variant = product?.variants?.find(
      (v: any) => v.id === item.variant_id,
    )

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, "variants"),
      },
    }
  }) as HttpTypes.StoreCartLineItem[]

  return enrichedItems
}

export const setShippingMethod = withAuthHeaders(
  async (
    request,
    authHeaders,
    {
      cartId,
      shippingMethodId,
    }: {
      cartId: string
      shippingMethodId: string
    },
  ) => {
    return sdk.store.cart
      .addShippingMethod(
        cartId,
        { option_id: shippingMethodId },
        {},
        authHeaders,
      )
      .catch(medusaError)
  },
)

export const initiatePaymentSession = withAuthHeaders(
  async (
    request,
    authHeaders,
    cart: HttpTypes.StoreCart,
    data: {
      provider_id: string
      context?: Record<string, unknown>
    },
  ) => {
    return sdk.store.payment
      .initiatePaymentSession(cart, data, {}, authHeaders)
      .catch(medusaError)
  },
)

export const applyPromotions = withAuthHeaders(
  async (request, authHeaders, codes: string[]) => {
    const cartId = await getCartId(request.headers)
    if (!cartId) {
      throw new Error("No existing cart found")
    }

    await updateCart(request, { promo_codes: codes }).catch(medusaError)
  },
)

export async function applyGiftCard(code: string) {
  //   const cartId = await getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, { gift_cards: [{ code }] }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export async function removeDiscount(code: string) {
  // const cartId = await getCartId()
  // if (!cartId) return "No cartId cookie found"
  // try {
  //   await deleteDiscount(cartId, code)
  //   revalidateTag("cart")
  // } catch (error: any) {
  //   throw error
  // }
}

export async function removeGiftCard(
  codeToRemove: string,
  giftCards: any[],
  // giftCards: GiftCard[]
) {
  //   const cartId = await getCartId()
  //   if (!cartId) return "No cartId cookie found"
  //   try {
  //     await updateCart(cartId, {
  //       gift_cards: [...giftCards]
  //         .filter((gc) => gc.code !== codeToRemove)
  //         .map((gc) => ({ code: gc.code })),
  //     }).then(() => {
  //       revalidateTag("cart")
  //     })
  //   } catch (error: any) {
  //     throw error
  //   }
}

export const submitPromotionForm = async (
  request: Request,
  currentState: unknown,
  formData: FormData,
) => {
  const code = formData.get("code") as string
  try {
    await applyPromotions(request, [code])
  } catch (e: any) {
    return e.message
  }
}

// TODO: Pass a POJO instead of a form entity here
export async function setAddresses(
  request: Request,
  currentState: unknown,
  formData: FormData,
) {
  try {
    if (!formData) {
      throw new Error("No form data found when setting addresses")
    }
    const cartId = await getCartId(request.headers)
    if (!cartId) {
      throw new Error("No existing cart found when setting addresses")
    }

    const data = {
      shipping_address: {
        first_name: formData.get("shipping_address.first_name"),
        last_name: formData.get("shipping_address.last_name"),
        address_1: formData.get("shipping_address.address_1"),
        address_2: "",
        company: formData.get("shipping_address.company"),
        postal_code: formData.get("shipping_address.postal_code"),
        city: formData.get("shipping_address.city"),
        country_code: formData.get("shipping_address.country_code"),
        province: formData.get("shipping_address.province"),
        phone: formData.get("shipping_address.phone"),
      },
      email: formData.get("email"),
    } as any

    const sameAsBilling = formData.get("same_as_billing")
    if (sameAsBilling === "on") data.billing_address = data.shipping_address

    if (sameAsBilling !== "on")
      data.billing_address = {
        first_name: formData.get("billing_address.first_name"),
        last_name: formData.get("billing_address.last_name"),
        address_1: formData.get("billing_address.address_1"),
        address_2: "",
        company: formData.get("billing_address.company"),
        postal_code: formData.get("billing_address.postal_code"),
        city: formData.get("billing_address.city"),
        country_code: formData.get("billing_address.country_code"),
        province: formData.get("billing_address.province"),
        phone: formData.get("billing_address.phone"),
      }
    await updateCart(request, data)
  } catch (e: any) {
    return e.message
  }

  redirect(
    `/${formData.get("shipping_address.country_code")}/checkout?step=delivery`,
  )
}

export const placeOrder = withAuthHeaders(
  async (request: Request, authHeaders) => {
    const cartId = await getCartId(request.headers)
    if (!cartId) {
      throw new Error("No existing cart found when placing an order")
    }

    const cartRes = await sdk.store.cart
      .complete(cartId, {}, authHeaders)
      .catch(medusaError)

    if (cartRes?.type === "order") {
      const countryCode =
        cartRes.order.shipping_address?.country_code?.toLowerCase()
      removeCartId(request.headers)
      redirect(`/${countryCode}/order/confirmed/${cartRes?.order.id}`)
    }

    return (
      cartRes as {
        cart: HttpTypes.StoreCart
      }
    )?.cart
  },
)

/**
 * Updates the countrycode param and revalidates the regions cache
 * @param regionId
 * @param countryCode
 */
export async function updateRegion(
  request: Request,
  countryCode: string,
  currentPath: string,
) {
  const cartId = await getCartId(request.headers)
  const region = await getRegion(countryCode)

  if (!region) {
    throw new Error(`Region not found for country code: ${countryCode}`)
  }

  if (cartId) {
    await updateCart(request, { region_id: region.id })
  }

  redirect(`/${countryCode}${currentPath}`)
}

import { useFetchers } from "@remix-run/react"
import { useEffect } from "react"
import { CheckoutAction } from "../../../../app/routes/_todo/api.checkout"
import { Cart, formDataToObject, Order } from "../.."
import { useSendEvent } from "../useAnalytics"

import { useSendEventOncePerSession } from "./useSendEventOncePerSession"

export const useSendBeginCheckoutEvent = (cart: Cart) => {
  const sendBeginCheckoutEvent = useSendEvent("begin_checkout")
  useSendEventOncePerSession(cart.id, () => sendBeginCheckoutEvent({ cart }))
}

export const useSendPurchaseEvent = (order: Order) => {
  const sendPurchaseEvent = useSendEvent("purchase")
  useSendEventOncePerSession(order.id, () => sendPurchaseEvent({ order }))
}

export const useCheckoutAnalytics = () => {
  const fetchers = useFetchers()
  const checkoutFetcher = fetchers.find((f) =>
    f.formAction?.includes("/api/checkout"),
  )
  const sendSignUpEvent = useSendEvent("sign_up")
  const sendAddShippingInfoEvent = useSendEvent("add_shipping_info")

  useEffect(() => {
    if (
      checkoutFetcher?.data &&
      checkoutFetcher?.formData &&
      checkoutFetcher?.state === "loading"
    ) {
      const data = formDataToObject(checkoutFetcher.formData)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
      const cart: Cart = checkoutFetcher.data.cart

      if (data.subaction === CheckoutAction.UPDATE_ACCOUNT_DETAILS) {
        if (data.password) {
          sendSignUpEvent({ method: "password", email: data.email as string })
        }
      }

      if (data.subaction === CheckoutAction.ADD_SHIPPING_METHODS) {
        sendAddShippingInfoEvent({ cart })
      }
    }
  }, [checkoutFetcher])
}

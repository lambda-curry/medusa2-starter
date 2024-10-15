import { useFetcher } from "@remix-run/react"
import { useEffect } from "react"
import { useCart } from "./useCart"
import { StoreCart, StoreCartLineItem } from "@medusajs/types"

export const useRemoveCartItem = (callback?: () => void) => {
  const fetcher = useFetcher<{ cart: StoreCart }>()
  const { cart } = useCart()

  const submit = ({ id: lineItemId, cart_id: cartId }: StoreCartLineItem) => {
    fetcher.submit(
      { lineItemId, cartId, subaction: "deleteItem" },
      { method: "delete", action: "/api/cart/line-items" },
    )
  }

  useEffect(() => {
    if (fetcher.data?.cart && cart) {
      callback?.()
    }
  }, [fetcher.data])

  return { fetcher, state: fetcher.state, submit }
}

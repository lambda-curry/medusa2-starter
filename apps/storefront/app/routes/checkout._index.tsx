import ShoppingCartIcon from "@heroicons/react/24/outline/ShoppingCartIcon"
import { useCart } from "@ui-components/hooks/useCart"
import { CheckoutProvider } from "@ui-components/providers/checkout-provider"
import { Button } from "@ui-components/common/buttons/Button"
// import { type PaymentMethod } from '@libs/utils-to-merge/types';
import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { CheckoutFlow } from "~/components/checkout/CheckoutFlow"
import { CheckoutSidebar } from "~/components/checkout/CheckoutSidebar"
import { Empty } from "@ui-components/common/Empty/Empty"
import {
  destroyCartSession,
  getCartSession,
} from "@libs/util/server/cart-session.server"
import { checkRequestAuthentication } from "@libs/util/server/check-request-authentication.server"
import {
  CartAddressDTO,
  CartDTO,
  StoreCart,
  StoreCartShippingOption,
  StoreOrder,
  StorePaymentProvider,
  StorePaymentSession,
  StoreShippingOption,
} from "@medusajs/types"
import { sdk } from "@libs/util/server/client.server"
import {
  getOrSetCart,
  initiatePaymentSession,
  retrieveCart,
} from "@libs/util/server/data/cart.server"
import {
  getCountryCode,
  getDefaultRegion,
} from "@libs/util/server/data/regions.server"
import { getCartId } from "@libs/util/server/cookies.server"
import { listCartPaymentMethods } from "@libs/util/server/data/payment.server"
import { BasePaymentSession } from "@medusajs/types/dist/http/payment/common"
// import { PaymentSession } from "@libs/util/medusa"
// import { PricedShippingOption } from "@markethaus/storefront-client"

const fetchShippingOptions = async (cartId: string) => {
  if (!cartId) return []

  try {
    const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
      cart_id: cartId,
    })
    return shipping_options
  } catch (e) {
    console.error(e)
    return []
  }
}

const fetchPaymentMethods = async (
  cartId: string,
  isAuthenticated: boolean,
) => {
  // return []
  // if (!cartId || !isAuthenticated) return []
  // try {
  //   const { payment_methods } = await sdk.store.customer.listPaymentMethods()
  //   return payment_methods
  // } catch (e) {
  //   console.error("Error occurred while fetching payment methods: ", e)
  //   return []
  // }
}

const ensureCartPaymentSessions = async (request: Request, cart: StoreCart) => {
  if (!cart) throw new Error("Cart was not provided.")

  let activeSession = cart.payment_collection?.payment_sessions?.find(
    (session) => session.status === "pending",
  )

  const [provider] = cart.payment_collection?.payment_providers || []

  if (!activeSession && provider) {
    const { payment_collection } = await initiatePaymentSession(request, cart, {
      provider_id: provider.id,
    })

    activeSession = payment_collection.payment_sessions?.find(
      (session) => session.status === "pending",
    )
  }

  return activeSession as BasePaymentSession
}

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<{
  shippingOptions: StoreCartShippingOption[]
  paymentProviders: StorePaymentProvider[]
  activePaymentSession: BasePaymentSession | null
}> => {
  // TODO: REMOVE try/catch
  try {
    const cartId = await getCartId(request.headers)

    if (!cartId) {
      return {
        shippingOptions: [],
        paymentProviders: [],
        activePaymentSession: null,
      }
    }

    const region = await getDefaultRegion()
    const [firstCountry] = region.countries || []
    const cart = await getOrSetCart(request, getCountryCode(firstCountry))

    if ((cart as CartDTO).completed_at) {
      const headers = new Headers()
      await destroyCartSession(headers)
      throw redirect(`/checkout/success?cart_id=${cart.id}`, { headers })
    }

    const [shippingOptions, paymentProviders, activePaymentSession] =
      await Promise.all([
        await fetchShippingOptions(cartId),
        (await listCartPaymentMethods(cartId)) as StorePaymentProvider[],
        await ensureCartPaymentSessions(request, cart),
      ])

    return { shippingOptions, paymentProviders, activePaymentSession }
  } catch (e) {
    console.error(e)
    return {
      shippingOptions: [],
      paymentProviders: [],
      activePaymentSession: null,
    }
  }
}

export default function CheckoutIndexRoute() {
  const { shippingOptions, paymentProviders, activePaymentSession } =
    useLoaderData<typeof loader>()

  const { cart } = useCart()

  if (!cart || !cart.items?.length)
    return (
      <Empty
        icon={ShoppingCartIcon}
        title="No items in your cart."
        description="Add items to your cart"
        action={
          <Button
            variant="primary"
            as={(buttonProps) => <Link to="/products" {...buttonProps} />}
          >
            Start shopping
          </Button>
        }
      />
    )

  return (
    <CheckoutProvider
      data={{
        activePaymentSession: activePaymentSession,
        shippingOptions: shippingOptions,
        paymentProviders,
      }}
    >
      <section>
        <div className="mx-auto max-w-2xl px-4 pb-8 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:max-w-7xl lg:px-8 lg:pb-24 lg:pt-16">
          <div className="lg:grid lg:grid-cols-[4fr_3fr] lg:gap-x-12 xl:gap-x-16">
            {/* Note: beforeInsert and Region are causing issues for the type for Shipping Options */}
            <CheckoutFlow />
            <CheckoutSidebar />
          </div>
        </div>
      </section>
    </CheckoutProvider>
  )
}

import ShoppingCartIcon from '@heroicons/react/24/outline/ShoppingCartIcon';
import { useCart } from '@ui-components/hooks/useCart';
import { CheckoutProvider } from '@ui-components/providers/checkout-provider';
import { Button } from '@components/buttons/Button';
import {
  createMedusaClient,
  Medusa,
} from '@marketplace/util/medusa/client.server';
import { type PaymentMethod } from '@utils/types';
import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { CheckoutFlow } from '~/components/checkout/CheckoutFlow';
import { CheckoutSidebar } from '~/components/checkout/CheckoutSidebar';
import { Empty } from '@components/Empty/Empty';
import {
  destroyCartSession,
  getCartSession,
} from '@marketplace/util/server/cart-session.server';
import { checkRequestAuthentication } from '@marketplace/util/server/check-request-authentication.server';
import { PaymentSession } from '@marketplace/util/medusa';
import { PricedShippingOption } from '@markethaus/storefront-client';

const fetchShippingOptions = async (cartId: string, medusa: Medusa) => {
  if (!cartId) return [];

  try {
    const { shipping_options } = await medusa.shippingOptions.listCartOptions(
      cartId
    );
    return shipping_options;
  } catch (e) {
    console.error(e);
    return [];
  }
};

const fetchPaymentMethods = async (
  cartId: string,
  medusa: Medusa,
  isAuthenticated: boolean
) => {
  if (!cartId || !isAuthenticated) return [];

  try {
    const { payment_methods } = await medusa.customers.listPaymentMethods();
    return payment_methods;
  } catch (e) {
    console.error('Error occurred while fetching payment methods: ', e);
    return [];
  }
};

const ensureCartPaymentSessions = async (cartId: string, client: Medusa) => {
  const { cart } = await client.carts.retrieve(cartId);

  if (!cart) throw new Error('Cart not found.');

  if (cart.payment_sessions.length && cart.payment_session)
    return cart.payment_sessions;

  const { cart: updatedCart } = await client.carts.createPaymentSessions(
    cartId
  );

  if (!updatedCart.payment_session && updatedCart.payment_sessions.length) {
    const { cart } = await client.carts.setPaymentSession(cartId, {
      provider_id: updatedCart.payment_sessions[0].provider_id,
    });
    return cart.payment_sessions;
  }

  return updatedCart.payment_sessions;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const medusa = await createMedusaClient({ request });
  const { cartId } = await getCartSession(request.headers);

  if (!cartId)
    return {
      shippingOptions: [] as PricedShippingOption[],
      paymentMethods: [] as { provider_id: string; data: object }[],
      paymentSessions: [] as PaymentSession[],
    };

  const { cart } = await medusa.carts.retrieve(cartId);

  if (cart.completed_at) {
    const headers = new Headers();
    await destroyCartSession(headers);
    throw redirect(`/checkout/success?cart_id=${cart.id}`, { headers });
  }

  const isAuthenticated = await checkRequestAuthentication(request);

  const [shippingOptions, paymentMethods, paymentSessions] = await Promise.all([
    await fetchShippingOptions(cartId, medusa),
    await fetchPaymentMethods(cartId, medusa, isAuthenticated),
    await ensureCartPaymentSessions(cartId, medusa),
  ]);

  return { shippingOptions, paymentMethods, paymentSessions };
};

export default function CheckoutIndexRoute() {
  const { shippingOptions, paymentMethods, paymentSessions } =
    useLoaderData<typeof loader>();

  const { cart } = useCart();

  if (!cart || !cart.items?.length)
    return (
      <Empty
        icon={ShoppingCartIcon}
        title="No items in your cart."
        description="Add items to your cart"
        action={
          <Button
            variant="primary"
            as={buttonProps => <Link to="/products" {...buttonProps} />}
          >
            Start shopping
          </Button>
        }
      />
    );

  return (
    <CheckoutProvider
      data={{
        paymentSessions: paymentSessions,
        shippingOptions: shippingOptions,
        paymentMethods: paymentMethods as PaymentMethod[],
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
  );
}

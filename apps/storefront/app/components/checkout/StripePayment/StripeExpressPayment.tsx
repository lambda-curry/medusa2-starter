import { type FC } from 'react';
import { StripeExpressCheckoutForm } from './StripeExpressPaymentForm';
import { StripeElementsOptionsMode } from '@stripe/stripe-js';
import { StripeElementsProvider } from './StripeElementsProvider';
import { getCartShippingProfileIds } from '@libs/util/vendors';
import { StoreCart } from '@medusajs/types';

interface StripeExpressCheckoutProps {
  cart: StoreCart;
}

export const StripeExpressCheckout: FC<StripeExpressCheckoutProps> = ({
  cart,
}) => {
  const cartProfileIds = getCartShippingProfileIds(cart);

  if (cartProfileIds.length > 1) {
    return null;
  }

  const cartSetupFutureUsage = cart.payment_session?.data
    ?.setup_future_usage as 'off_session' | 'on_session' | undefined;

  const options: StripeElementsOptionsMode = {
    mode: 'payment',
    amount: cart.total,
    currency: cart.region?.currency_code || 'usd',
    setupFutureUsage: cartSetupFutureUsage ?? 'off_session',
    capture_method: 'manual',
  };

  return (
    <StripeElementsProvider options={options}>
      <StripeExpressCheckoutForm />
    </StripeElementsProvider>
  );
};

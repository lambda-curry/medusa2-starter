import { type FC } from 'react';
import { StripeExpressCheckoutForm } from './StripeExpressPaymentForm';
import { StripeElementsOptionsMode } from '@stripe/stripe-js';
import { StripeElementsProvider } from './StripeElementsProvider';
import { StoreCart } from '@medusajs/types';
import { useCheckout } from '@app/hooks/useCheckout';

interface StripeExpressCheckoutProps {
  cart: StoreCart;
}

export const StripeExpressCheckout: FC<StripeExpressCheckoutProps> = ({ cart }) => {
  const { activePaymentSession } = useCheckout();
  // TODO: extract the stripe payment session

  const cartSetupFutureUsage = activePaymentSession?.data?.setup_future_usage as
    | 'off_session'
    | 'on_session'
    | undefined;

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

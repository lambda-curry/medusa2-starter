import { FC, useEffect } from 'react';
import { useCart } from '@ui-components/hooks/useCart';
import { useCheckout } from '@ui-components/hooks/useCheckout';
import { useCustomer } from '@ui-components/hooks/useCustomer';
import { useEnv } from '@ui-components/hooks/useEnv';
import { Alert } from '@components/alert/Alert';
import { CheckoutAccountDetails } from './CheckoutAccountDetails';
import { CheckoutDeliveryMethod } from './CheckoutDeliveryMethod';
import { CheckoutPayment } from './CheckoutPayment';
import {
  useCheckoutAnalytics,
  useSendBeginCheckoutEvent,
} from '@libs/util/analytics/hooks/checkout';
import { StripeExpressCheckout } from './StripePayment/StripeExpressPayment';

export const CheckoutFlow: FC = () => {
  const { env } = useEnv();
  const { cart } = useCart();
  const { customer } = useCustomer();
  const { goToNextStep } = useCheckout();
  const isLoggedIn = !!customer?.id;

  if (!cart) return;

  useCheckoutAnalytics();
  useSendBeginCheckoutEvent(cart);

  useEffect(() => {
    if (isLoggedIn) goToNextStep();
    return () => goToNextStep();
  }, [isLoggedIn]);

  const shippingDisabled = env.DISABLE_SHIPPING;

  return (
    <>
      <div className="checkout-flow lg:min-h-[calc(100vh-320px)] lg:pl-8">
        {isLoggedIn && (
          <Alert type="info" className="mb-8">
            Checking out as:{' '}
            <strong className="font-bold">
              {customer.first_name} {customer.last_name} ({customer.email})
            </strong>
          </Alert>
        )}

        <StripeExpressCheckout cart={cart} />

        <CheckoutAccountDetails />

        <hr className="my-10" />

        {!shippingDisabled && (
          <>
            <CheckoutDeliveryMethod />
          </>
        )}

        <CheckoutPayment />
      </div>
    </>
  );
};

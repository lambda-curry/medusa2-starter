import { FC, PropsWithChildren, useMemo } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useEnv } from '@ui-components/hooks/useEnv';
import { useCheckout } from '@ui-components/hooks/useCheckout';

export interface StripeElementsProviderProps extends PropsWithChildren {
  options?: StripeElementsOptions;
}

export const StripeElementsProvider: FC<StripeElementsProviderProps> = ({
  options,
  children,
}) => {
  const { env } = useEnv();
  const { paymentSessions } = useCheckout();

  const stripePromise = useMemo(
    () => (env.STRIPE_PUBLIC_KEY ? loadStripe(env.STRIPE_PUBLIC_KEY) : null),
    []
  );
  const stripeSession = useMemo(
    () => paymentSessions.find(s => s.provider_id === 'stripe'),
    [paymentSessions]
  ) as unknown as {
    data: { client_secret: string };
  };

  const clientSecret = stripeSession?.data?.client_secret as string;

  if (!stripeSession || !stripePromise) return null;

  return (
    <Elements
      stripe={stripePromise}
      key={clientSecret}
      options={
        options ?? {
          clientSecret: clientSecret,
        }
      }
    >
      {children}
    </Elements>
  );
};

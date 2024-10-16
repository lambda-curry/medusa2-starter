import { FC, PropsWithChildren, useMemo } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useEnv } from '@app/hooks/useEnv';
import { useCheckout } from '@app/hooks/useCheckout';

export interface StripeElementsProviderProps extends PropsWithChildren {
  options?: StripeElementsOptions;
}

export const StripeElementsProvider: FC<StripeElementsProviderProps> = ({ options, children }) => {
  const { env } = useEnv();
  const { cart } = useCheckout();

  const stripePromise = useMemo(() => (env.STRIPE_PUBLIC_KEY ? loadStripe(env.STRIPE_PUBLIC_KEY) : null), []);

  const stripeSession = useMemo(
    () => cart?.payment_collection?.payment_sessions?.find((s) => s.provider_id === 'pp_stripe_stripe'),
    [cart?.payment_collection?.payment_sessions],
  ) as unknown as {
    data: { client_secret: string };
  };

  const clientSecret = stripeSession?.data?.client_secret as string;

  if (!stripeSession || !stripePromise || !clientSecret) return null;

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

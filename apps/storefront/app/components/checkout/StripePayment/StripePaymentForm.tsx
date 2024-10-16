import { FC, FormEvent, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { SubmitFunction } from '@remix-run/react';
import { PaymentMethodCreateParams, StripePaymentElement } from '@stripe/stripe-js';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import clsx from 'clsx';
import type { CustomPaymentSession, Address, MedusaAddress } from '@libs/types';
import { UpdatePaymentInput } from '@app/routes/api.checkout';
import { CompleteCheckoutForm } from '../CompleteCheckoutForm';
import { Alert } from '@app/components/common/alert/Alert';
import { useCheckout } from '@app/hooks/useCheckout';
import { medusaAddressToAddress } from '@libs/util';

export interface StripePaymentFormProps extends PropsWithChildren {
  isActiveStep: boolean;
  paymentMethods: CustomPaymentSession[];
}

export const StripePaymentForm: FC<StripePaymentFormProps> = ({ isActiveStep, paymentMethods }) => {
  const [stripeElement, setStripeElement] = useState<StripePaymentElement>();
  const [stripeError, setStripeError] = useState<string | undefined>();
  const stripe = useStripe();
  const elements = useElements();
  const { activePaymentSession, cart } = useCheckout();
  const stripePaymentMethods = useMemo(
    () => paymentMethods?.filter((pm) => pm.provider_id === 'pp_stripe_stripe'),
    [paymentMethods],
  );

  useEffect(() => {
    if (!elements) return;
    elements.fetchUpdates();
  }, [activePaymentSession?.payment?.updated_at]); // TODO: CHECK if this is correct

  const hasPaymentMethods = stripePaymentMethods.length > 0;

  const initialPaymentMethodId = hasPaymentMethods ? stripePaymentMethods[0].data?.id : 'new';

  useEffect(() => {
    if (isActiveStep && stripeElement) stripeElement.focus();
  }, [isActiveStep, stripeElement]);

  if (!cart || !stripe || !elements) return null;

  const handleSubmit = async (
    data: UpdatePaymentInput,
    event: FormEvent<HTMLFormElement>,
    {
      setSubmitting,
      submit,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      submit: SubmitFunction;
    },
  ) => {
    setStripeError(undefined);
    if (data.paymentMethodId !== 'new') {
      submit(event.target as HTMLFormElement);
      return;
    }
    // NOTE: We default the cart billing address to be the same as the shipping address in the `ACCOUNT_DETAILS` step.
    const address = (
      data.sameAsShipping ? medusaAddressToAddress(cart.billing_address as MedusaAddress) : data.billingAddress
    ) as Address;

    const stripeBillingDetails: PaymentMethodCreateParams.BillingDetails = {
      name: `${address.firstName} ${address.lastName}`,
      email: cart.email,
      phone: address.phone || '',
      address: {
        line1: address.address1 || '',
        line2: address.address2 || '',
        city: address.city || '',
        state: address.province || '',
        postal_code: address.postalCode || '',
        country: address.countryCode || '',
      },
    };

    setSubmitting(true);

    return stripe
      .confirmPayment({
        //`Elements` instance that was used to create the Payment Element
        elements,
        confirmParams: {
          // return_url: siteURL(redirectPath),
          return_url: 'http://localhost:3000/checkout/success',

          // We need to add the billing details manually because we are disabling
          // the billing address fields on the `PaymentElement`
          payment_method_data: { billing_details: stripeBillingDetails },
        },
        redirect: 'if_required',
      })
      .then(({ paymentIntent, error }) => {
        if (error) {
          setStripeError(error.message);
          setSubmitting(false);
          stripeElement?.focus();
          return;
        }

        submit(event.target as HTMLFormElement);

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Show error to your customer (e.g., payment
        // details incomplete)
        // if (error) return handleError(error);
        // if (!is_default) return handleSuccess(setupIntent);
      })
      .catch((error) => {
        setSubmitting(false);
        console.error(error);
      });
  };

  const handlePaymentElementReady = (element: StripePaymentElement) => {
    setStripeElement(element);
  };

  return (
    <>
      <CompleteCheckoutForm
        providerId="pp_stripe_stripe"
        id="stripePaymentForm"
        paymentMethods={stripePaymentMethods}
        onSubmit={handleSubmit}
      >
        <div
          className={clsx({
            'h-0 overflow-hidden opacity-0': hasPaymentMethods && initialPaymentMethodId !== 'new',
          })}
        >
          <PaymentElement
            onReady={handlePaymentElementReady}
            className="my-6 w-full"
            options={{
              // To disable these fields in the form, we have to pass the billing country at "confirm-time"
              fields: {
                billingDetails: {
                  address: { country: 'never', postalCode: 'never' },
                },
              },
              terms: { card: 'never' },
            }}
          />
          {stripeError && (
            <Alert type="error" className={clsx('form__error -mt-4 mb-2')}>
              {stripeError}
            </Alert>
          )}
        </div>
      </CompleteCheckoutForm>
    </>
  );
};

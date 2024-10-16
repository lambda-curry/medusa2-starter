import { FC, FormEvent, PropsWithChildren, useEffect, useState } from 'react';
import { type Fetcher, SubmitFunction, useFetcher, useFetchers } from '@remix-run/react';
import { type CustomPaymentSession, type MedusaAddress } from '@libs/types';
import { convertToFormData } from '@libs/util/forms/objectToFormData';
import { CheckoutAction, UpdatePaymentInput, UpdateBillingAddressInput } from '@app/routes/api.checkout';
import { useFormContext } from 'remix-validated-form';
import { CheckoutOrderSummary, checkoutPaymentValidator } from '.';
import isEqual from 'lodash/isEqual';
import { SubmitButton } from '@app/components/common/buttons/SubmitButton';
import { Form } from '@app/components/common/forms/Form';
import { FieldGroup } from '@app/components/common/forms/fields/FieldGroup';
import { FieldCheckbox } from '@app/components/common/forms/fields/FieldCheckbox';
import { FormError } from '@app/components/common/forms/FormError';
import { AddressDisplay } from './address/AddressDisplay';
import {
  MedusaStripeAddress,
  defaultStripeAddress,
  type StripeAddress,
} from './MedusaStripeAddress/MedusaStripeAddress';
import HiddenAddressGroup from './HiddenAddressGroup';
import { emptyAddress, medusaAddressToAddress } from '@libs/util';
import { useCheckout } from '@app/hooks/useCheckout';

export interface CompleteCheckoutFormProps extends PropsWithChildren {
  id: string;
  providerId: string;
  paymentMethods: CustomPaymentSession[];
  submitMessage?: string;
  className?: string;
  onSubmit?: (
    data: UpdatePaymentInput,
    event: FormEvent<HTMLFormElement>,
    methods: {
      setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
      submit: SubmitFunction;
    },
  ) => Promise<void>;
}

export const CompleteCheckoutForm: FC<CompleteCheckoutFormProps> = ({
  id,
  submitMessage,
  onSubmit,
  paymentMethods,
  children,
  providerId,
  className,
}) => {
  const { activePaymentSession, cart } = useCheckout();
  const fetchers = useFetchers() as (Fetcher & { formAction: string })[];
  const checkoutFetchers = fetchers.filter(
    (f) => f.formAction && (f.formAction === '/api/checkout' || f.formAction === '/api/cart/line-items'),
  );
  const isCheckoutLoading = checkoutFetchers.some((fetcher) => ['submitting', 'loading'].includes(fetcher.state));

  const submitPaymentFetcher = useFetcher<never>();
  const [submitting, setSubmitting] = useState(false);
  const isSubmitting = ['submitting', 'loading'].includes(submitPaymentFetcher.state) || submitting;

  const [newBillingAddress, setNewBillingAddress] = useState<StripeAddress>(
    defaultStripeAddress(cart?.shipping_address),
  );

  // Note: this helps prevent people from getting stuck if they try to submit with Cash App or Google Pay and then close out of that UI
  const { fieldErrors: stripeFieldError } = useFormContext('stripePaymentForm');
  useEffect(() => {
    if (stripeFieldError.formError) {
      setSubmitting(false);
    }
  }, [stripeFieldError]);

  const paymentMethodsForProvider = paymentMethods.filter((paymentMethod) => paymentMethod.provider_id === providerId);
  const hasPaymentMethods = paymentMethodsForProvider.length > 0;
  const initialPaymentMethodId = hasPaymentMethods ? paymentMethodsForProvider[0].data.id : 'new';
  const [sameAsShipping, setSameAsShipping] = useState<boolean | undefined>(true);

  if (!cart) return null;

  const billingAddress = medusaAddressToAddress(cart.billing_address as MedusaAddress);

  const countryOptions =
    (cart.region?.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    })) as { value: string; label: string }[]) ?? [];

  const defaultValues: UpdatePaymentInput = {
    cartId: cart.id,
    paymentMethodId: initialPaymentMethodId,
    sameAsShipping: true,
    billingAddress: emptyAddress,
    providerId,
  };

  const handleSubmit = async (data: UpdatePaymentInput, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.target as HTMLFormElement;

    setSubmitting(true);

    if (data.billingAddress && !data.sameAsShipping && !isEqual(billingAddress, data.billingAddress)) {
      const formData = convertToFormData({
        cartId: data.cartId,
        subaction: CheckoutAction.UPDATE_BILLING_ADDRESS,
        billingAddress: data.billingAddress,
      } as UpdateBillingAddressInput);

      await fetch('/api/checkout', { method: 'post', body: formData });
    }

    if (typeof onSubmit === 'function') {
      return await onSubmit(data, event, {
        setSubmitting,
        submit: submitPaymentFetcher.submit,
      });
    }

    return submitPaymentFetcher.submit(formElement);
  };

  const PaymentSubmitButton = () => (
    <SubmitButton
      form={id}
      className="w-full lg:w-auto"
      disabled={isSubmitting || isCheckoutLoading || (!sameAsShipping && !newBillingAddress.completed)}
    >
      {isSubmitting ? 'Confirming...' : (submitMessage ?? 'Confirm & Pay')}
    </SubmitButton>
  );

  if (!activePaymentSession) return null;

  return (
    <>
      <Form<UpdatePaymentInput, CheckoutAction.COMPLETE_CHECKOUT>
        id={id}
        method="post"
        action="/api/checkout"
        fetcher={submitPaymentFetcher}
        subaction={CheckoutAction.COMPLETE_CHECKOUT}
        defaultValues={defaultValues}
        // @ts-ignore Validator<UpdatePaymentInput>
        validator={checkoutPaymentValidator}
        onSubmit={handleSubmit}
        className={className}
      >
        <input type="hidden" name="cartId" value={cart.id} />
        <input type="hidden" name="providerId" value={providerId} />

        <h3 className="text-lg font-bold text-gray-900">Billing address</h3>

        <FieldGroup>
          <FieldCheckbox
            name="sameAsShipping"
            label="Same as shipping address"
            onChange={(event) => setSameAsShipping(event.target.checked)}
            inputProps={{ defaultChecked: sameAsShipping }}
            className="mb-2"
          />
        </FieldGroup>

        {!sameAsShipping && (
          <MedusaStripeAddress mode="billing" address={billingAddress} setAddress={setNewBillingAddress} />
        )}

        <HiddenAddressGroup address={newBillingAddress.address} prefix="billingAddress" />

        {sameAsShipping && (
          <div className="-mt-2 mb-4">
            <AddressDisplay address={billingAddress} countryOptions={countryOptions} />
          </div>
        )}

        {!hasPaymentMethods && <input type="hidden" name="paymentMethodId" value="new" />}

        <div className={`stripe-payment-form ${initialPaymentMethodId !== 'new' ? 'hidden' : ''}`}>{children}</div>

        <FormError />
      </Form>

      <div className="block lg:hidden">
        <CheckoutOrderSummary name="checkout" submitButton={<PaymentSubmitButton />} />
      </div>

      <div className="hidden lg:block">
        <PaymentSubmitButton />
      </div>
    </>
  );
};

import { SubmitButton } from '@app/components/common/remix-hook-form/buttons/SubmitButton';
import { useCheckout } from '@app/hooks/useCheckout';
import { CompleteCheckoutFormData, completeCheckoutSchema } from '@app/routes/api.checkout.complete';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox, TextField } from '@lambdacurry/forms/remix-hook-form';
import { type CustomPaymentSession, type MedusaAddress } from '@libs/types';
import { emptyAddress, medusaAddressToAddress } from '@libs/util';
import { FetcherKeys } from '@libs/util/fetcher-keys';
import { FC, FormEvent, PropsWithChildren, useState } from 'react';
import { SubmitFunction, useFetcher } from 'react-router';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';
import { FormError } from '../common/remix-hook-form/forms/FormError';
import { CheckoutOrderSummary } from '.';
import { AddressDisplay } from './address/AddressDisplay';
import HiddenAddressGroup from './HiddenAddressGroup';
import {
  defaultStripeAddress,
  MedusaStripeAddress,
  type StripeAddress,
} from './MedusaStripeAddress/MedusaStripeAddress';

export interface CompleteCheckoutFormProps extends PropsWithChildren {
  id: string;
  providerId: string;
  paymentMethods: CustomPaymentSession[];
  submitMessage?: string;
  className?: string;
  onSubmit?: (
    data: CompleteCheckoutFormData,
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
  const { activePaymentSession, cart, isCartMutating } = useCheckout();

  const completeCartFetcher = useFetcher<never>({ key: FetcherKeys.cart.completeCheckout });

  const [submitting, setSubmitting] = useState(false);

  const isSubmitting = ['submitting', 'loading'].includes(completeCartFetcher.state) || submitting;

  const paymentMethodsForProvider = paymentMethods.filter((paymentMethod) => paymentMethod.provider_id === providerId);

  const hasPaymentMethods = paymentMethodsForProvider.length > 0;

  const initialPaymentMethodId = hasPaymentMethods ? paymentMethodsForProvider[0].data.id : 'new';

  if (!cart) return null;

  const defaultBillingAddress = medusaAddressToAddress(cart.billing_address as MedusaAddress);
  const shippingAddress = defaultStripeAddress(cart?.shipping_address) ?? emptyAddress;

  const countryOptions =
    (cart.region?.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    })) as { value: string; label: string }[]) ?? [];

  const defaultValues: CompleteCheckoutFormData = {
    cartId: cart.id,
    paymentMethodId: initialPaymentMethodId,
    sameAsShipping: true,
    billingAddress: defaultBillingAddress,
    providerId,
  };

  const form = useRemixForm({
    resolver: zodResolver(completeCheckoutSchema),
    defaultValues,
    fetcher: completeCartFetcher,
    submitConfig: {
      method: 'post',
      action: '/api/checkout/complete',
    },
  });

  const sameAsShipping = form.watch('sameAsShipping');
  const billingAddress = form.watch('billingAddress');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);

    const data = form.getValues();

    if (typeof onSubmit === 'function') {
      return await onSubmit(data, event, {
        setSubmitting,
        submit: () => form.handleSubmit(),
      });
    }

    return form.handleSubmit();
  };

  const setBillingAddress = (address: StripeAddress) => {
    form.setValue('billingAddress.address1', address.address.address1 ?? '');
    form.setValue('billingAddress.address2', address.address.address2 ?? '');
    form.setValue('billingAddress.city', address.address.city ?? '');
    form.setValue('billingAddress.province', address.address.province ?? '');
    form.setValue('billingAddress.countryCode', address.address.countryCode ?? '');
    form.setValue('billingAddress.postalCode', address.address.postalCode ?? '');
    form.setValue('billingAddress.phone', address.address.phone ?? '');
    form.setValue('billingAddress.firstName', address.address.firstName ?? '');
    form.setValue('billingAddress.lastName', address.address.lastName ?? '');
    form.setValue('billingAddress.company', address.address.company ?? '');
    form.setValue('billingAddress.phone', address.address.phone ?? '');
  };

  const PaymentSubmitButton = () => (
    <SubmitButton
      form={id}
      className="w-full lg:w-auto"
      disabled={isSubmitting || isCartMutating || (!sameAsShipping && !billingAddress)}
    >
      {isSubmitting ? 'Confirming...' : (submitMessage ?? 'Confirm & Pay')}
    </SubmitButton>
  );

  if (!activePaymentSession) return null;

  return (
    <>
      <RemixFormProvider {...form}>
        <completeCartFetcher.Form id={id} onSubmit={handleSubmit} className={className}>
          <TextField type="hidden" name="cartId" value={cart.id} />
          <TextField type="hidden" name="providerId" value={providerId} />

          <h3 className="text-lg font-bold text-gray-900">Billing address</h3>

          <Checkbox className="my-4" name="sameAsShipping" label="Same as shipping address" />

          {!sameAsShipping && (
            <MedusaStripeAddress mode="billing" address={billingAddress} setAddress={setBillingAddress} />
          )}

          <HiddenAddressGroup address={billingAddress} prefix="billingAddress" />

          {sameAsShipping && (
            <div className="-mt-2 mb-4">
              <AddressDisplay address={shippingAddress.address} countryOptions={countryOptions} />
            </div>
          )}

          {!hasPaymentMethods && <input type="hidden" name="paymentMethodId" value="new" />}

          <div className={`stripe-payment-form ${initialPaymentMethodId !== 'new' ? 'hidden' : ''}`}>{children}</div>

          <FormError />
        </completeCartFetcher.Form>

        <div className="block lg:hidden">
          <CheckoutOrderSummary name="checkout" submitButton={<PaymentSubmitButton />} />
        </div>

        <div className="hidden lg:block">
          <PaymentSubmitButton />
        </div>
      </RemixFormProvider>
    </>
  );
};

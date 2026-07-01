import { Actions } from '@app/components/common/actions/Actions';
import { Button } from '@app/components/common/buttons/Button';
import { StyledTextField } from '@app/components/common/remix-hook-form/forms/fields/StyledTextField';
import { useCheckout } from '@app/hooks/useCheckout';
import { useCustomer } from '@app/hooks/useCustomer';
import { useRegions } from '@app/hooks/useRegions';
import { CheckoutStep } from '@app/providers/checkout-provider';
import { type AccountDetailsFormData, accountDetailsSchema } from '@app/routes/api.checkout.account-details';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@lambdacurry/forms/remix-hook-form';
import type { MedusaAddress } from '@libs/types';
import { medusaAddressToAddress } from '@libs/util';
import { checkAccountDetailsComplete } from '@libs/util/checkout';
import { FetcherKeys } from '@libs/util/fetcher-keys';
import type { StoreRegion, StoreRegionCountry } from '@medusajs/types';
import { useEffect } from 'react';
import { FieldErrors } from 'react-hook-form';
import { useFetcher } from 'react-router';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';
import { SubmitButton } from '../common/remix-hook-form/buttons/SubmitButton';
import { FormError } from '../common/remix-hook-form/forms/FormError';
import { CheckoutSectionHeader } from './CheckoutSectionHeader';
import HiddenAddressGroup from './HiddenAddressGroup';
import { MedusaStripeAddress, type StripeAddress } from './MedusaStripeAddress/MedusaStripeAddress';
import { AddressDisplay } from './address/AddressDisplay';
import { selectInitialShippingAddress } from './checkout-form-helpers';

const NEW_SHIPPING_ADDRESS_ID = 'new';

export const CheckoutAccountDetails = () => {
  const checkoutAccountDetailsFormFetcher = useFetcher<{
    errors: FieldErrors;
  }>({ key: FetcherKeys.cart.accountDetails });
  const { customer } = useCustomer();
  const { regions } = useRegions();
  const { step, setStep, goToNextStep, cart, isCartMutating } = useCheckout();
  const isActiveStep = step === CheckoutStep.ACCOUNT_DETAILS;

  if (!cart) return null;

  const allowedCountries = (regions ?? []).flatMap(
    (region: StoreRegion) => region.countries!.map((country: StoreRegionCountry) => country.iso_2) as string[],
  );

  const initialShippingAddress = selectInitialShippingAddress(cart, customer!);

  const isComplete = checkAccountDetailsComplete(cart);

  const isSubmitting = ['submitting', 'loading'].includes(checkoutAccountDetailsFormFetcher.state);

  const hasErrors = !!checkoutAccountDetailsFormFetcher.data?.errors;

  const initialShippingAddressId = initialShippingAddress?.id ?? NEW_SHIPPING_ADDRESS_ID;

  const countryOptions =
    (cart.region?.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    })) as { value: string; label: string }[]) ?? [];

  const defaultShippingAddress = medusaAddressToAddress(initialShippingAddress as MedusaAddress);

  const defaultValues: AccountDetailsFormData = {
    cartId: cart.id,
    email: customer?.email || cart.email || '',
    customerId: customer?.id,
    shippingAddress: {
      firstName: defaultShippingAddress.firstName ?? '',
      lastName: defaultShippingAddress.lastName ?? '',
      company: defaultShippingAddress.company,
      address1: defaultShippingAddress.address1 ?? '',
      address2: defaultShippingAddress.address2,
      city: defaultShippingAddress.city ?? '',
      province: defaultShippingAddress.province ?? '',
      countryCode: defaultShippingAddress.countryCode ?? '',
      postalCode: defaultShippingAddress.postalCode ?? '',
      phone: defaultShippingAddress.phone,
    },
    shippingAddressId: initialShippingAddressId,
  };

  const form = useRemixForm<AccountDetailsFormData>({
    resolver: zodResolver(accountDetailsSchema),
    defaultValues,
    fetcher: checkoutAccountDetailsFormFetcher,
    submitConfig: {
      method: 'post',
      action: '/api/checkout/account-details',
    },
  });

  const setShippingAddress = (address: StripeAddress) => {
    form.setValue('shippingAddress.address1', address.address.address1 ?? '');
    form.setValue('shippingAddress.address2', address.address.address2 ?? '');
    form.setValue('shippingAddress.city', address.address.city ?? '');
    form.setValue('shippingAddress.province', address.address.province ?? '');
    form.setValue('shippingAddress.countryCode', address.address.countryCode ?? '');
    form.setValue('shippingAddress.postalCode', address.address.postalCode ?? '');
    form.setValue('shippingAddress.phone', address.address.phone ?? '');
    form.setValue('shippingAddress.firstName', address.address.firstName ?? '');
    form.setValue('shippingAddress.lastName', address.address.lastName ?? '');
    form.setValue('shippingAddress.company', address.address.company ?? '');
    form.setValue('shippingAddress.phone', address.address.phone ?? '');
  };

  const shippingAddress = form.watch('shippingAddress');

  useEffect(() => {
    if (isActiveStep && !isSubmitting && !hasErrors && isComplete) {
      form.reset();
      goToNextStep();
    }
  }, [isSubmitting, isComplete]);

  const handleCancel = () => {
    goToNextStep();
  };

  const showCompleted = isComplete && !isActiveStep;

  return (
    <div className="checkout-account-details">
      <CheckoutSectionHeader completed={showCompleted} setStep={setStep} step={CheckoutStep.ACCOUNT_DETAILS}>
        Account details
      </CheckoutSectionHeader>

      {!isActiveStep && isComplete && (
        <AddressDisplay title="Shipping Address" address={shippingAddress} countryOptions={countryOptions} />
      )}

      {isActiveStep && (
        <>
          {customer?.email ? (
            <p className="mt-2 text-sm mb-2">To get started, please select your shipping address.</p>
          ) : (
            <p className="mt-2 text-sm mb-4">To get started, enter your email address.</p>
          )}

          <RemixFormProvider {...form}>
            <checkoutAccountDetailsFormFetcher.Form id="checkout-account-details-form" onSubmit={form.handleSubmit}>
              <TextField type="hidden" name="cartId" />
              <TextField type="hidden" name="customerId" />

              <StyledTextField
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                label="Email Address"
                className="[&_input]:!ring-0 mb-2"
              />

              <HiddenAddressGroup address={shippingAddress} prefix="shippingAddress" />

              <StyledTextField type="hidden" name="shippingAddressId" value={initialShippingAddressId} />

              <MedusaStripeAddress
                mode="shipping"
                address={shippingAddress}
                allowedCountries={allowedCountries}
                setAddress={setShippingAddress}
              />

              <FormError />

              <Actions>
                <SubmitButton disabled={isSubmitting || isCartMutating}>
                  {isSubmitting ? 'Saving...' : 'Save and continue'}
                </SubmitButton>

                {isComplete && (
                  <Button disabled={isSubmitting} onClick={handleCancel}>
                    Cancel edit
                  </Button>
                )}
              </Actions>
            </checkoutAccountDetailsFormFetcher.Form>
          </RemixFormProvider>
        </>
      )}
    </div>
  );
};

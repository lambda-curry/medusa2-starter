import { Actions } from '@app/components/common/actions/Actions';
import { Button } from '@app/components/common/buttons/Button';
import { ButtonLink } from '@app/components/common/buttons/ButtonLink';
import { SubmitButton } from '@app/components/common/buttons/SubmitButton';
import { Form } from '@app/components/common/forms/Form';
import { FormError } from '@app/components/common/forms/FormError';
import { FieldGroup } from '@app/components/common/forms/fields/FieldGroup';
import { FieldText } from '@app/components/common/forms/fields/FieldText';
import { useCheckout } from '@app/hooks/useCheckout';
import { useCustomer } from '@app/hooks/useCustomer';
import { useRegions } from '@app/hooks/useRegions';
import { checkAccountDetailsComplete } from '@libs/util/checkout';
import { useFetcher } from '@remix-run/react';
import debounce from 'lodash/debounce';
import { useEffect, useRef, useState } from 'react';
import { useControlField, useFormContext } from 'remix-validated-form';
import { CheckoutAction, type UpdateAccountDetailsInput, type UpdateContactInfoInput } from '@app/routes/api.checkout';
import { useLogin } from '@app/hooks/useLogin';
import { CheckoutStep } from '@app/providers/checkout-provider';
import { emailAddressValidation } from '@libs/util/validation';
import { CheckoutSectionHeader } from './CheckoutSectionHeader';
import HiddenAddressGroup from './HiddenAddressGroup';
import {
  MedusaStripeAddress,
  defaultStripeAddress,
  type StripeAddress,
} from './MedusaStripeAddress/MedusaStripeAddress';
import { AddressDisplay } from './address/AddressDisplay';
import {
  checkoutAccountDetailsValidator,
  checkoutUpdateContactInfoValidator,
  selectInitialShippingAddressId,
} from './checkout-form-helpers';
import type { StoreRegion, StoreRegionCountry } from '@medusajs/types';
import { emptyAddress } from '@libs/util';

import type { MedusaAddress } from '@libs/types';
import { medusaAddressToAddress } from '@libs/util';

const NEW_SHIPPING_ADDRESS_ID = 'new';
export const CheckoutAccountDetails = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const checkoutContactInfoFormFetcher = useFetcher<{}>();
  const checkoutAccountDetailsFormFetcher = useFetcher<{
    fieldErrors: Record<string, string>;
  }>();
  const form = useFormContext('checkoutAccountDetailsForm');
  const { customer } = useCustomer();
  const { step, setStep, goToNextStep, cart } = useCheckout();
  const isActiveStep = step === CheckoutStep.ACCOUNT_DETAILS;

  if (!cart) return null;

  const { regions } = useRegions();
  const allowedCountries = (regions ?? []).flatMap(
    (region: StoreRegion) => region.countries!.map((country: StoreRegionCountry) => country.iso_2) as string[],
  );
  const [newShippingAddress, setNewShippingAddress] = useState<StripeAddress>(defaultStripeAddress());

  const isComplete = checkAccountDetailsComplete(cart);
  const isSubmitting = ['submitting', 'loading'].includes(checkoutAccountDetailsFormFetcher.state);

  const hasErrors = !!checkoutAccountDetailsFormFetcher.data?.fieldErrors;
  const isLoggedIn = !!customer?.id;

  const hasShippingAddresses: boolean = !!(customer?.addresses && customer?.addresses.length > 0);

  const initialShippingAddressId = selectInitialShippingAddressId(cart, customer as any);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useControlField(
    'shippingAddressId',
    'checkoutAccountDetailsForm',
  );

  const { toggleLoginModal } = useLogin();

  const countryOptions =
    (cart.region?.countries?.map((country) => ({
      value: country.iso_2,
      label: country.display_name,
    })) as { value: string; label: string }[]) ?? [];

  const addressWithUserPostalCode = cart.shipping_address
    ? {
        ...cart.shipping_address,
        postal_code: cart.shipping_address.postal_code,
      }
    : null;

  const shippingAddress = medusaAddressToAddress(addressWithUserPostalCode as MedusaAddress);

  const defaultValues = {
    cartId: cart.id,
    email: customer?.email || cart.email || '',
    customerId: customer?.id,
    allowSuggestions: true,
    shippingAddress: {
      ...emptyAddress,
      ...(isLoggedIn ? {} : shippingAddress || {}),
    },
    shippingAddressId: initialShippingAddressId,
  };

  // on load, submit form with default values if there is only one shipping address
  useEffect(() => {
    if (!formRef.current || !customer?.addresses || customer.addresses.length > 1 || initialShippingAddressId) return;
    const formData = new FormData(formRef.current);
    form.reset();
    checkoutAccountDetailsFormFetcher.submit(formData, {
      method: 'post',
      action: '/api/checkout',
    });
  }, [formRef.current]);

  useEffect(() => setSelectedShippingAddressId(initialShippingAddressId), [customer?.addresses?.length]);

  useEffect(() => {
    if (isActiveStep && !isSubmitting && !hasErrors && isComplete) {
      setSelectedShippingAddressId(initialShippingAddressId);
      form.reset();
      goToNextStep();
    }
  }, [isSubmitting, isComplete]);

  useEffect(() => {
    if (isLoggedIn) setSelectedShippingAddressId(initialShippingAddressId);
  }, [isLoggedIn]);

  const handleCancel = () => {
    setSelectedShippingAddressId(initialShippingAddressId);
    goToNextStep();
  };

  const handleEmailChange = debounce(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const isEmailValid = await emailAddressValidation.email.isValid(e.target.value);
      if (!isEmailValid) return;

      checkoutContactInfoFormFetcher.submit(new FormData(e.target.form as HTMLFormElement), {
        method: 'post',
        action: '/api/checkout',
      });
    },
    500,
    { leading: true },
  );

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
            <p className="mt-2 text-sm">To get started, please select your shipping address.</p>
          ) : (
            <p className="mt-2 text-sm">
              To get started, enter your email address or{' '}
              <ButtonLink size="sm" onClick={() => toggleLoginModal()}>
                log in to your account
              </ButtonLink>
              .
            </p>
          )}

          {!customer?.email && (
            <Form<UpdateContactInfoInput, CheckoutAction.UPDATE_CONTACT_INFO>
              id="checkoutContactInfoForm"
              method="post"
              action="/api/checkout"
              fetcher={checkoutContactInfoFormFetcher}
              subaction={CheckoutAction.UPDATE_CONTACT_INFO}
              defaultValues={defaultValues}
              validator={checkoutUpdateContactInfoValidator}
            >
              <FieldText id="accountUpdateEmail" type="hidden" name="cartId" />

              <FieldGroup>
                <FieldText
                  inputProps={{
                    autoFocus: true,
                  }}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email address"
                  label="Email Address"
                  onChange={handleEmailChange}
                />
              </FieldGroup>

              <FormError />
            </Form>
          )}

          <Form<UpdateAccountDetailsInput, CheckoutAction.UPDATE_ACCOUNT_DETAILS>
            formRef={formRef}
            id="checkoutAccountDetailsForm"
            method="post"
            action="/api/checkout"
            fetcher={checkoutAccountDetailsFormFetcher}
            defaultValues={defaultValues}
            subaction={CheckoutAction.UPDATE_ACCOUNT_DETAILS}
            // @ts-ignore
            validator={checkoutAccountDetailsValidator}
          >
            <FieldText type="hidden" name="cartId" />
            <FieldText type="hidden" name="customerId" />
            <FieldText type="hidden" name="email" value={cart.email ?? ''} />
            <FieldText type="hidden" name="allowSuggestions" />

            <HiddenAddressGroup address={newShippingAddress.address} prefix="shippingAddress" />

            {!hasShippingAddresses && (
              <FieldText type="hidden" name="shippingAddressId" value={NEW_SHIPPING_ADDRESS_ID} />
            )}

            {(!isLoggedIn || selectedShippingAddressId === 'new' || !hasShippingAddresses) && (
              <MedusaStripeAddress
                mode="shipping"
                address={shippingAddress}
                allowedCountries={allowedCountries}
                setAddress={setNewShippingAddress}
              />
            )}

            <FormError />

            <Actions>
              <SubmitButton
                disabled={isSubmitting || (!newShippingAddress.completed && selectedShippingAddressId === 'new')}
              >
                {isSubmitting ? 'Saving...' : 'Save and continue'}
              </SubmitButton>

              {isComplete && (
                <Button disabled={isSubmitting} onClick={handleCancel}>
                  Cancel edit
                </Button>
              )}
            </Actions>
          </Form>
        </>
      )}
    </div>
  );
};

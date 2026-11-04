import { Alert } from '@app/components/common/alert/Alert';
import { useCheckout } from '@app/hooks/useCheckout';
import { CheckoutStep } from '@app/providers/checkout-provider';
import {
  ChooseCheckoutShippingMethodsFormData,
  shippingMethodsSchema,
} from '@app/routes/api.checkout.shipping-methods';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField } from '@lambdacurry/forms/remix-hook-form/text-field';
import {
  checkAccountDetailsComplete,
  checkDeliveryMethodComplete,
  getShippingOptionsByProfile,
} from '@libs/util/checkout';
import { formatPrice } from '@libs/util/prices';
import { StoreCart, StoreCartShippingOption } from '@medusajs/types';
import { BaseCartShippingMethod } from '@medusajs/types/dist/http/cart/common';
import { FC, Fragment, useEffect, useMemo } from 'react';
import { useFetcher } from 'react-router';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';
import { StripeSecurityImage } from '../images/StripeSecurityImage';
import { CheckoutSectionHeader } from './CheckoutSectionHeader';
import { ShippingOptionsRadioGroup } from './checkout-fields/ShippingOptionsRadioGroup/ShippingOptionsRadioGroup';

const getShippingOptionsDefaultValues = (
  cart: StoreCart,
  shippingOptionsByProfile: { [key: string]: StoreCartShippingOption[] },
) => {
  const values = cart.shipping_methods?.map((sm) => sm.shipping_option_id) ?? [];

  return Object.values(shippingOptionsByProfile).reduce((acc, shippingOptions) => {
    const match = shippingOptions.find((so) => values.includes(so.id));
    acc.push(match ? match.id : shippingOptions[0].id);
    return acc;
  }, [] as string[]);
};

const getDefaultValues = (cart: StoreCart, shippingOptionsByProfile: { [key: string]: StoreCartShippingOption[] }) =>
  ({
    cartId: cart.id,
    shippingOptionIds: getShippingOptionsDefaultValues(cart, shippingOptionsByProfile),
  }) as ChooseCheckoutShippingMethodsFormData;

export const CheckoutDeliveryMethod: FC = () => {
  const fetcher = useFetcher<{ errors?: any; cart?: StoreCart }>();
  const { step, shippingOptions, setStep, goToNextStep, cart, isCartMutating } = useCheckout();
  const isActiveStep = step === CheckoutStep.PAYMENT;
  const isSubmitting = ['submitting', 'loading'].includes(fetcher.state);
  if (!cart) return null;

  const hasErrors = !!fetcher.data?.errors;
  const hasCompletedAccountDetails = checkAccountDetailsComplete(cart);
  const shippingOptionsByProfile = useMemo(() => getShippingOptionsByProfile(shippingOptions), [shippingOptions]);
  const isComplete = useMemo(() => checkDeliveryMethodComplete(cart, shippingOptions), [cart, shippingOptions]);

  const defaultValues: ChooseCheckoutShippingMethodsFormData = useMemo(
    () => getDefaultValues(cart, shippingOptionsByProfile),
    [cart, shippingOptionsByProfile],
  );

  const form = useRemixForm({
    resolver: zodResolver(shippingMethodsSchema),
    defaultValues,
    fetcher,
    submitConfig: {
      method: 'post',
      action: '/api/checkout/shipping-methods',
    },
  });

  const values = form.watch('shippingOptionIds');

  useEffect(() => {
    form.setValue('shippingOptionIds', cart.shipping_methods?.map((sm) => sm.shipping_option_id!) ?? []);
  }, [cart.shipping_methods]);

  useEffect(() => {
    if (isActiveStep && !isSubmitting && !hasErrors && isComplete) goToNextStep();
  }, [isSubmitting, isComplete]);

  const showCompleted = !isActiveStep && hasCompletedAccountDetails;

  return (
    <div className="checkout-delivery-method">
      <CheckoutSectionHeader completed={showCompleted} setStep={setStep} step={CheckoutStep.PAYMENT}>
        Delivery & Payment
      </CheckoutSectionHeader>

      {!isActiveStep && (
        <>
          {cart.shipping_methods?.length === 0 && <StripeSecurityImage className="mt-4" />}
          <dl>
            {cart.shipping_methods?.map((shippingMethod: BaseCartShippingMethod, shippingMethodIndex) => {
              const { id, shipping_option_id, amount } = shippingMethod;
              const shipping_option = shippingOptions.find((so) => so.id === shipping_option_id);

              return (
                <Fragment key={id}>
                  <dt className={`${shippingMethodIndex > 0 ? 'mt-6' : 'mt-4'} text-sm font-bold text-gray-700`}>
                    Delivery method for: All items
                  </dt>
                  <dd className="mt-0.5">
                    {shipping_option?.name} (
                    {formatPrice(amount, {
                      currency: cart?.region?.currency_code,
                    })}
                    )
                  </dd>
                </Fragment>
              );
            })}
          </dl>
        </>
      )}

      {isActiveStep && (
        <RemixFormProvider {...form}>
          <fetcher.Form>
            <TextField type="hidden" name="cartId" value={cart.id} />
            {Object.entries(shippingOptionsByProfile).map(
              ([profileId, shippingOptions], shippingOptionProfileIndex) => {
                if (shippingOptions.length < 1) return null;

                return (
                  <Fragment key={profileId}>
                    {shippingOptionProfileIndex > 0 && <hr className="my-6" />}

                    {!!cart?.shipping_methods?.length && (
                      <Alert type="info" className="my-6">
                        Choose your delivery option
                      </Alert>
                    )}
                    <ShippingOptionsRadioGroup
                      disabled={isCartMutating}
                      name={`shippingOptionIds.${shippingOptionProfileIndex}`}
                      shippingOptions={shippingOptions}
                      region={cart.region!}
                      value={values?.[shippingOptionProfileIndex] ?? null}
                      onValueChange={(value) => form.setValue(`shippingOptionIds.${shippingOptionProfileIndex}`, value)}
                    />
                  </Fragment>
                );
              },
            )}
          </fetcher.Form>
        </RemixFormProvider>
      )}
    </div>
  );
};

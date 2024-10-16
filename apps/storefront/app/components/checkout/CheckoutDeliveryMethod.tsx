import { useCheckout } from '@app/hooks/useCheckout';
import { CheckoutStep } from '@app/providers/checkout-provider';
import { Alert } from '@app/components/common/alert/Alert';
import { Form } from '@app/components/common/forms/Form';
import { FormError } from '@app/components/common/forms/FormError';
import {
  checkAccountDetailsComplete,
  checkDeliveryMethodComplete,
  getShippingOptionsByProfile,
} from '@libs/util/checkout';
import { formatPrice } from '@libs/util/prices';
import { Fetcher, useFetcher, useFetchers } from '@remix-run/react';
import { FC, Fragment, useEffect, useMemo, useRef } from 'react';
import { useField } from 'remix-validated-form';
import { AddShippingMethodInput, CheckoutAction } from '@app/routes/api.checkout';
import { CheckoutSectionHeader } from './CheckoutSectionHeader';
import { ShippingOptionsRadioGroup } from './checkout-fields/ShippingOptionsRadioGroup/ShippingOptionsRadioGroup';
import { getCheckoutAddShippingMethodValidator } from './checkout-form-helpers';
import { StripeSecurityImage } from '../images/StripeSecurityImage';
import { StoreCart, StoreCartShippingOption } from '@medusajs/types';
import { BaseCartShippingMethod } from '@medusajs/types/dist/http/cart/common';

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
  }) as AddShippingMethodInput;

export const CheckoutDeliveryMethod: FC = () => {
  const fetcher = useFetcher<{ fieldErrors: any }>();
  const { step, shippingOptions, setStep, goToNextStep, cart } = useCheckout();
  const isActiveStep = step === CheckoutStep.PAYMENT;
  const isSubmitting = ['submitting', 'loading'].includes(fetcher.state);
  if (!cart) return null;

  const hasErrors = !!fetcher.data?.fieldErrors;
  const hasCompletedAccountDetails = checkAccountDetailsComplete(cart);
  const shippingOptionsByProfile = useMemo(() => getShippingOptionsByProfile(shippingOptions), [shippingOptions]);
  const isComplete = useMemo(() => checkDeliveryMethodComplete(cart, shippingOptions), [cart, shippingOptions]);
  const fetchers = useFetchers() as (Fetcher & { formAction: string })[];
  const lineItemFetchers = fetchers.filter((f) => f.formAction && f.formAction === '/api/cart/line-items');
  const lineItemFetchersLoading = lineItemFetchers.some((fetcher) => ['loading'].includes(fetcher.state));

  const validator = getCheckoutAddShippingMethodValidator(shippingOptions);
  const { error: fieldError, clearError: clearFieldError } = useField('shippingOptionIds', {
    formId: 'checkoutDeliveryMethodForm',
  });

  const formRef = useRef<HTMLFormElement>(null);

  const defaultValues: AddShippingMethodInput = useMemo(
    () => getDefaultValues(cart, shippingOptionsByProfile),
    [cart, shippingOptionsByProfile],
  );

  useEffect(() => {
    if (!formRef.current || cart.shipping_methods?.length) return;

    formRef.current.reset();
    const formData = new FormData(formRef.current);

    Object.entries(shippingOptionsByProfile).map(([profileId, shippingOptions], shippingOptionProfileIndex) => {
      formData.set(
        `shippingOptionIds[${shippingOptionProfileIndex}]`,
        defaultValues.shippingOptionIds[shippingOptionProfileIndex],
      );
    });

    fetcher.submit(formData, { action: '/api/checkout', method: 'post' });
  }, [formRef.current, lineItemFetchersLoading, cart.shipping_methods?.length]);

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
        <Form<AddShippingMethodInput, CheckoutAction.ADD_SHIPPING_METHODS>
          id="checkoutDeliveryMethodForm"
          formRef={formRef}
          method="post"
          action="/api/checkout"
          fetcher={fetcher}
          subaction={CheckoutAction.ADD_SHIPPING_METHODS}
          validator={validator}
          defaultValues={defaultValues}
        >
          <input type="hidden" name="cartId" value={cart.id} />
          {Object.entries(shippingOptionsByProfile).map(([profileId, shippingOptions], shippingOptionProfileIndex) => {
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
                  name={`shippingOptionIds[${shippingOptionProfileIndex}]`}
                  shippingOptions={shippingOptions}
                  region={cart.region!}
                  onChange={(value) => {
                    const formData = new FormData(formRef.current as HTMLFormElement);
                    formData.set(`shippingOptionIds[${shippingOptionProfileIndex}]`, value);
                    fetcher.submit(formData, {
                      action: '/api/checkout',
                      method: 'post',
                    });
                  }}
                />
              </Fragment>
            );
          })}

          <FormError error={fieldError} onClearClick={clearFieldError} />
        </Form>
      )}
    </div>
  );
};

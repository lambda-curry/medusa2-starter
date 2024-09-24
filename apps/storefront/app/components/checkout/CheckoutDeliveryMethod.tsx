import { useCart } from '@ui-components/hooks/useCart';
import { useCheckout } from '@ui-components/hooks/useCheckout';
import { CheckoutStep } from '@ui-components/providers/checkout-provider';
import { Alert } from '@components/alert/Alert';
import { Form } from '@components/forms/Form';
import { FormError } from '@components/forms/FormError';
import {
  checkAccountDetailsComplete,
  checkDeliveryMethodComplete,
  getShippingOptionsByProfile,
} from '@marketplace/util/checkout';
import { formatPrice } from '@marketplace/util/prices';
import {
  Fetcher,
  FetcherWithComponents,
  useFetcher,
  useFetchers,
} from '@remix-run/react';
import { FC, Fragment, useEffect, useMemo, useRef } from 'react';
import { useField } from 'remix-validated-form';
import { AddShippingMethodInput, CheckoutAction } from '~/routes/api.checkout';
import { CheckoutSectionHeader } from './CheckoutSectionHeader';
import { ShippingOptionsRadioGroup } from './checkout-fields/ShippingOptionsRadioGroup/ShippingOptionsRadioGroup';
import { getCheckoutAddShippingMethodValidator } from './checkout-form-helpers';
import { StripeSecurityImage } from '../images/StripeSecurityImage';
import { Cart } from '@marketplace/util/medusa';
import { ShippingOption } from '@markethaus/storefront-client';

const getShippingOptionsDefaultValues = (
  cart: Cart,
  shippingOptionsByProfile: { [key: string]: ShippingOption[] }
) => {
  const values = cart.shipping_methods?.map(sm => sm.shipping_option_id) ?? [];

  return Object.values(shippingOptionsByProfile).reduce(
    (acc, shippingOptions) => {
      const match = shippingOptions.find(so => values.includes(so.id));
      acc.push(match ? match.id : shippingOptions[0].id);
      return acc;
    },
    [] as string[]
  );
};

const getDefaultValues = (
  cart: Cart,
  shippingOptionsByProfile: { [key: string]: ShippingOption[] }
) => ({
  cartId: cart.id,
  shippingOptionIds: getShippingOptionsDefaultValues(
    cart,
    shippingOptionsByProfile
  ),
});

export const CheckoutDeliveryMethod: FC = () => {
  const fetcher = useFetcher<{ fieldErrors: any }>();
  const { cart } = useCart();
  const { step, shippingOptions, setStep, goToNextStep } = useCheckout();
  const isActiveStep = step === CheckoutStep.PAYMENT;
  const isSubmitting = ['submitting', 'loading'].includes(fetcher.state);
  if (!cart) return null;

  const hasErrors = !!fetcher.data?.fieldErrors;
  const hasCompletedAccountDetails = checkAccountDetailsComplete(cart);
  const shippingOptionsByProfile = useMemo(
    () => getShippingOptionsByProfile(shippingOptions),
    [shippingOptions]
  );
  const isComplete = useMemo(
    () => checkDeliveryMethodComplete(cart, shippingOptions),
    [cart, shippingOptions]
  );
  const fetchers = useFetchers() as (Fetcher & { formAction: string })[];
  const lineItemFetchers = fetchers.filter(
    f => f.formAction && f.formAction === '/api/cart/line-items'
  );
  const lineItemFetchersLoading = lineItemFetchers.some(fetcher =>
    ['loading'].includes(fetcher.state)
  );

  const validator = getCheckoutAddShippingMethodValidator(shippingOptions);
  const { error: fieldError, clearError: clearFieldError } = useField(
    'shippingOptionIds',
    {
      formId: 'checkoutDeliveryMethodForm',
    }
  );

  const formRef = useRef<HTMLFormElement>(null);

  const defaultValues: AddShippingMethodInput = useMemo(
    () => getDefaultValues(cart, shippingOptionsByProfile),
    [cart, shippingOptionsByProfile]
  );

  useEffect(() => {
    if (!formRef.current) return;

    formRef.current.reset();
    const formData = new FormData(formRef.current);

    Object.entries(shippingOptionsByProfile).map(
      ([profileId, shippingOptions], shippingOptionProfileIndex) => {
        formData.set(
          `shippingOptionIds[${shippingOptionProfileIndex}]`,
          defaultValues.shippingOptionIds[shippingOptionProfileIndex]
        );
      }
    );

    fetcher.submit(formData, { action: '/api/checkout', method: 'post' });
  }, [formRef.current, lineItemFetchersLoading]);

  useEffect(() => {
    if (isActiveStep && !isSubmitting && !hasErrors && isComplete)
      goToNextStep();
  }, [isSubmitting, isComplete]);

  const showCompleted = !isActiveStep && hasCompletedAccountDetails;

  return (
    <div className="checkout-delivery-method">
      <CheckoutSectionHeader
        completed={showCompleted}
        setStep={setStep}
        step={CheckoutStep.PAYMENT}
      >
        Delivery & Payment
      </CheckoutSectionHeader>

      {!isActiveStep && (
        <>
          {cart.shipping_methods?.length === 0 && (
            <StripeSecurityImage className="mt-4" />
          )}
          <dl>
            {cart.shipping_methods?.map(
              ({ id, shipping_option, price }, shippingMethodIndex) => {
                const profileItems = cart.items?.filter(
                  item =>
                    item.variant?.product?.profile_id ===
                    shipping_option?.profile_id
                );
                const profileItemsList = profileItems
                  ?.map(item => item.variant?.product?.title)
                  .join(', ');

                return (
                  <Fragment key={id}>
                    <dt
                      className={`${
                        shippingMethodIndex > 0 ? 'mt-6' : 'mt-4'
                      } text-sm font-bold text-gray-700`}
                    >
                      Delivery method for: {profileItemsList}
                    </dt>
                    <dd className="mt-0.5">
                      {shipping_option?.name} (
                      {formatPrice(price, {
                        currency: cart?.region?.currency_code,
                      })}
                      )
                    </dd>
                  </Fragment>
                );
              }
            )}
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
          {Object.entries(shippingOptionsByProfile).map(
            ([profileId, shippingOptions], shippingOptionProfileIndex) => {
              const profileItems =
                cart.items?.filter(
                  item => item.variant?.product?.profile_id === profileId
                ) ?? [];
              const profileItemsList = profileItems
                .map(item => item.variant?.product?.title)
                .join(', ');

              if (shippingOptions.length < 1) return null;

              return (
                <Fragment key={profileId}>
                  {shippingOptionProfileIndex > 0 && <hr className="my-6" />}

                  {Object.keys(shippingOptionsByProfile).length > 1 && (
                    <Alert type="info" className="my-6">
                      Choose your delivery option for: {profileItemsList}
                    </Alert>
                  )}

                  <ShippingOptionsRadioGroup
                    name={`shippingOptionIds[${shippingOptionProfileIndex}]`}
                    shippingOptions={shippingOptions}
                    region={cart.region!}
                    onChange={value => {
                      const formData = new FormData(
                        formRef.current as HTMLFormElement
                      );
                      formData.set(
                        `shippingOptionIds[${shippingOptionProfileIndex}]`,
                        value
                      );
                      fetcher.submit(formData, {
                        action: '/api/checkout',
                        method: 'post',
                      });
                    }}
                  />
                </Fragment>
              );
            }
          )}

          <FormError error={fieldError} onClearClick={clearFieldError} />
        </Form>
      )}
    </div>
  );
};

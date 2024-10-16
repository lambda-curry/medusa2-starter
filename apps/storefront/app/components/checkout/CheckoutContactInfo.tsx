import { FC, useEffect, useRef } from 'react';
import { useFetcher } from '@remix-run/react';
import { CheckoutAction, UpdateContactInfoInput } from '@app/routes/api.checkout';
import { checkoutUpdateContactInfoValidator } from './checkout-form-helpers';
import { checkContactInfoComplete } from '@libs/util/checkout';
import { useCustomer } from '@app/hooks/useCustomer';
import { useLogin } from '@app/hooks/useLogin';
import { useCheckout } from '@app/hooks/useCheckout';
import { CheckoutStep } from '@app/providers/checkout-provider';
import { ButtonLink } from '@app/components/common/buttons/ButtonLink';
import { Form } from '@app/components/common/forms/Form';
import { FieldGroup } from '@app/components/common/forms/fields/FieldGroup';
import { FieldText } from '@app/components/common/forms/fields/FieldText';
import { FormError } from '@app/components/common/forms/FormError';
import { Actions } from '@app/components/common/actions/Actions';
import { SubmitButton } from '@app/components/common/buttons/SubmitButton';
import { Button } from '@app/components/common/buttons/Button';
import { CheckoutSectionHeader } from './CheckoutSectionHeader';
import { ActionFunctionArgs } from '@remix-run/node';

export const CheckoutContactInfo: FC = () => {
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<(args: ActionFunctionArgs) => { fieldErrors?: any }>();
  const { customer } = useCustomer();
  const { toggleLoginModal } = useLogin();
  const { step, setStep, goToNextStep, cart } = useCheckout();
  const isActiveStep = step === CheckoutStep.CONTACT_INFO;

  if (!cart) return null;
  const isComplete = checkContactInfoComplete(cart);
  const isSubmitting = ['submitting', 'loading'].includes(fetcher.state);
  const hasErrors = !!fetcher.data?.fieldErrors;

  const defaultValues: UpdateContactInfoInput = {
    cartId: cart.id,
    email: cart.email || customer?.email || '',
  };

  useEffect(() => {
    if (isActiveStep && !isSubmitting && !hasErrors && isComplete) goToNextStep();
  }, [isSubmitting, isComplete]);

  const handleCancel = () => goToNextStep();

  useEffect(() => {
    if (isActiveStep) firstInputRef.current?.focus();
  }, [isActiveStep]);

  const showCompleted = isComplete && !isActiveStep;

  return (
    <div className="checkout-contact-info">
      <CheckoutSectionHeader completed={showCompleted} setStep={setStep} step={CheckoutStep.CONTACT_INFO}>
        Contact information
      </CheckoutSectionHeader>

      {!isActiveStep && isComplete && (
        <dl>
          <dt className="mt-4 text-sm font-bold text-gray-700">Email address</dt>
          <dd className="mt-0.5">{cart.email}</dd>
        </dl>
      )}

      {isActiveStep && (
        <>
          <p className="mt-2 text-sm">
            To get started, enter your email address or{' '}
            <ButtonLink size="sm" onClick={() => toggleLoginModal()}>
              log in to your account
            </ButtonLink>
            .
          </p>

          <Form<UpdateContactInfoInput, CheckoutAction.UPDATE_CONTACT_INFO>
            id="checkoutContactInfoForm"
            method="post"
            action="/api/checkout"
            fetcher={fetcher}
            subaction={CheckoutAction.UPDATE_CONTACT_INFO}
            defaultValues={defaultValues}
            validator={checkoutUpdateContactInfoValidator}
          >
            <input type="hidden" name="cartId" value={cart.id} />
            <FieldGroup>
              <FieldText
                inputRef={firstInputRef}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                fieldOptions={{
                  validationBehavior: {
                    initial: 'onSubmit',
                    whenTouched: 'onSubmit',
                    whenSubmitted: 'onChange',
                  },
                }}
              />
            </FieldGroup>

            <FormError />

            <Actions>
              <SubmitButton disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save and continue'}</SubmitButton>

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

import { FC, useEffect, useRef, useState } from 'react';
import { AddDiscountCodeInput, CheckoutAction } from '@app/routes/api.checkout';
import { checkoutAddDiscountCodeValidator } from '../checkout-form-helpers';
import { FetcherWithComponents, useFetcher } from '@remix-run/react';
import { RemovePromotionCodeButton } from './RemoveDiscountCodeButton';
import { ButtonLink } from '@app/components/common/buttons/ButtonLink';
import { Form } from '@app/components/common/forms/Form';
import { FieldLabel } from '@app/components/common/forms/fields/FieldLabel';
import { FieldGroup } from '@app/components/common/forms/fields/FieldGroup';
import { FieldText } from '@app/components/common/forms/fields/FieldText';
import { SubmitButton } from '@app/components/common/buttons/SubmitButton';
import { FormError } from '@app/components/common/forms/FormError';
import { HttpTypes, PromotionDTO } from '@medusajs/types';

export interface CheckoutOrderSummaryDiscountCodeProps {
  cart: HttpTypes.StoreCart & { promotions: PromotionDTO[] };
}

export const CheckoutOrderSummaryDiscountCode: FC<CheckoutOrderSummaryDiscountCodeProps> = ({ cart }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<{
    fieldErrors?: { [key: string]: string };
  }>() as FetcherWithComponents<{
    fieldErrors?: { [key: string]: string };
  }>;
  const [isFormVisible, setIsFormVisible] = useState<boolean>(!!(cart.promotions as PromotionDTO[]).length);
  const hasDiscounts = !!cart.promotions?.length;
  const hasErrors = Object.keys(fetcher.data?.fieldErrors || {}).length > 0;
  const isSubmitting = ['submitting', 'loading'].includes(fetcher.state);

  const defaultValues: AddDiscountCodeInput = {
    cartId: cart.id,
    code: '',
  };

  useEffect(() => {
    if (!isSubmitting && !hasErrors) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [isSubmitting, hasErrors]);

  const handleAddCodeClick = () => {
    setIsFormVisible(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div className="mb-6">
      {!isFormVisible && (
        <div>
          <ButtonLink size="sm" onClick={handleAddCodeClick}>
            Add promo code
          </ButtonLink>
        </div>
      )}

      {isFormVisible && (
        <>
          <Form<AddDiscountCodeInput, CheckoutAction.ADD_DISCOUNT_CODE>
            formRef={formRef}
            id="CheckoutorderSummaryDiscountCodeForm"
            method="post"
            action="/api/checkout"
            fetcher={fetcher}
            subaction={CheckoutAction.ADD_DISCOUNT_CODE}
            defaultValues={defaultValues}
            validator={checkoutAddDiscountCodeValidator}
          >
            <input type="hidden" name="cartId" value={cart.id} />
            <FieldLabel htmlFor="code" className="sr-only">
              Discount code
            </FieldLabel>
            <FieldGroup className="!my-0 !flex items-start gap-1">
              <FieldText
                inputRef={inputRef}
                name="code"
                className="flex-grow"
                placeholder="Discount code"
                aria-label="discount code"
              />
              <SubmitButton className="flex-shrink-0 flex-grow-0">
                {isSubmitting ? 'Applying...' : 'Apply'}
              </SubmitButton>
            </FieldGroup>
            <FormError className="mb-0" />
          </Form>

          {hasDiscounts && (
            <div className="mt-2">
              {cart.promotions?.map((promotion) => (
                <RemovePromotionCodeButton key={promotion.id} cart={cart} promotion={promotion} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

import { QuantitySelector } from '@app/components/common/field-groups/QuantitySelector';
import { Form } from '@app/components/common/forms/Form';
import { FetcherWithComponents, useFetcher } from '@remix-run/react';
import clsx from 'clsx';
import { ChangeEvent, FC, HTMLAttributes } from 'react';
import * as Yup from 'yup';
import { StoreCartLineItem } from '@medusajs/types';

const lineItemValidation = Yup.object().shape({
  quantity: Yup.number().required(),
});

export interface LineItemQuantitySelectProps extends HTMLAttributes<HTMLFormElement> {
  formId: string;
  item: StoreCartLineItem;
  maxInventory?: number;
}

export const LineItemQuantitySelect: FC<LineItemQuantitySelectProps> = ({
  formId,
  item,
  className,
  maxInventory = 10,
  ...props
}) => {
  const fetcher = useFetcher<{}>() as FetcherWithComponents<{}>;
  const isLoading = ['submitting', 'loading'].includes(fetcher.state);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    fetcher.submit(
      {
        subaction: 'updateItem',
        lineItemId: item.id,
        cartId: item.cart_id,
        quantity: event.target.value,
      },
      { method: 'post', action: '/api/cart/line-items' },
    );
  };

  return (
    <Form
      id={formId}
      fetcher={fetcher}
      className={clsx('line-item-quantity-select', className)}
      validationSchema={lineItemValidation}
      defaultValues={{ quantity: item.quantity }}
      {...props}
      onSubmit={() => {}}
    >
      <QuantitySelector
        formId={formId}
        className={clsx({
          'pointer-events-none opacity-50': isLoading,
        })}
        variant={item.variant as any}
        onChange={handleChange}
      />
    </Form>
  );
};

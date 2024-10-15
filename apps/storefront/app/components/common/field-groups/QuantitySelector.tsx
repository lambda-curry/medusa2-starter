import clsx from 'clsx';
import { FC } from 'react';
import { FieldSelect, FieldSelectProps } from '../forms/fields/FieldSelect';
import { StoreProductVariant } from '@medusajs/types';

interface QuantitySelectorProps extends Omit<FieldSelectProps, 'name' | 'options'> {
  variant: StoreProductVariant | undefined;
  maxInventory?: number;
  className?: string;
  formId?: string;
}

export const QuantitySelector: FC<QuantitySelectorProps> = ({
  formId,
  className,
  variant,
  maxInventory = 10,
  ...props
}) => {
  return (
    <>
      <label htmlFor="quantity" className="sr-only">
        Quantity
      </label>
      <FieldSelect
        id={`${formId ?? ''}-${variant?.id ?? ''}`}
        name="quantity"
        className={clsx('w-28 flex-grow-0', className)}
        inputProps={{ className: '!h-12 !w-full' }}
        prefix="Qty"
        options={[
          ...Array(
            !variant?.manage_inventory || (variant?.inventory_quantity || 0) >= maxInventory
              ? maxInventory
              : variant?.inventory_quantity,
          ),
        ].map((_, index) => ({
          label: `${index + 1}`,
          value: `${index + 1}`,
        }))}
        {...props}
      />
    </>
  );
};

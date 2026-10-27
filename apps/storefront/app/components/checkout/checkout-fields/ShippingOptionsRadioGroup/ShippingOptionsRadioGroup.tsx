import { RadioGroup } from '@lambdacurry/forms/ui';
import { StoreCartShippingOption, StoreRegion } from '@medusajs/types';
import { clsx } from 'clsx';
import { FC } from 'react';
import { useRemixFormContext } from 'remix-hook-form';
import { ShippingOptionsRadioGroupOption } from './ShippingOptionsRadioGroupOption';

export interface ShippingOptionsRadioGroupProps {
  name: string;
  shippingOptions: StoreCartShippingOption[];
  region: StoreRegion;
  value?: string | null;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const ShippingOptionsRadioGroup: FC<ShippingOptionsRadioGroupProps> = ({
  name,
  shippingOptions,
  region,
  value,
  onValueChange,
  disabled,
}) => {
  const form = useRemixFormContext();
  const isSubmitting = form.formState.isSubmitting;

  const handleChange = async (newValue: string) => {
    if (isSubmitting) return;
    onValueChange?.(newValue);

    try {
      await form.handleSubmit();
    } catch (error) {
      console.error('Failed to submit shipping option:', error);
    }
  };

  if (!shippingOptions.length) {
    return <div>No shipping options available</div>;
  }

  return (
    <RadioGroup
      name={name}
      value={value ?? ''}
      onValueChange={handleChange}
      className={clsx('xs:grid-cols-2 my-6 grid grid-cols-1 gap-4', isSubmitting && 'pointer-events-none')}
      disabled={isSubmitting || disabled}
    >
      {shippingOptions.map((shippingOption) => (
        <ShippingOptionsRadioGroupOption key={shippingOption.id} shippingOption={shippingOption} region={region} />
      ))}
    </RadioGroup>
  );
};

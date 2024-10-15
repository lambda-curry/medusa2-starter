import { FC } from 'react';
import { useControlField, useField } from 'remix-validated-form';
import { RadioGroup } from '@headlessui/react';
import { ShippingOptionsRadioGroupOption } from './ShippingOptionsRadioGroupOption';
import { FieldError } from '@app/components/common/forms/fields/FieldError';
import { Fetcher, useFetchers } from '@remix-run/react';
import clsx from 'clsx';
import { StoreCartShippingOption, StoreRegion } from '@medusajs/types';

export interface ShippingOptionsRadioGroupProps {
  name: string;
  shippingOptions: StoreCartShippingOption[];
  region: StoreRegion;
  onChange?: (value: string) => void;
}

export const ShippingOptionsRadioGroup: FC<ShippingOptionsRadioGroupProps> = ({
  name,
  shippingOptions,
  region,
  onChange,
}) => {
  const [value, setValue] = useControlField(name, 'checkoutDeliveryMethodForm');
  const { error, clearError } = useField(name, {
    formId: 'checkoutDeliveryMethodForm',
  });
  const fetchers = useFetchers() as (Fetcher & { formAction: string })[];
  const checkoutFetchers = fetchers.filter(
    (f) => f.formAction && (f.formAction === '/api/checkout' || f.formAction === '/api/cart/line-items'),
  );
  const isCheckoutLoading = checkoutFetchers.some((fetcher) => ['submitting', 'loading'].includes(fetcher.state));

  const handleChange = (value: string) => {
    setValue(value);
    clearError();
    if (typeof onChange === 'function') onChange(value);
  };

  return (
    <>
      <RadioGroup
        className={clsx({ 'pointer-events-none': isCheckoutLoading })}
        name={name}
        defaultChecked={true}
        value={value}
        defaultValue={shippingOptions[0].id}
        onChange={handleChange}
      >
        <div className="xs:grid-cols-2 my-6 grid grid-cols-1 gap-4">
          {shippingOptions.map((shippingOption) => (
            <ShippingOptionsRadioGroupOption key={shippingOption.id} shippingOption={shippingOption} region={region} />
          ))}
        </div>
      </RadioGroup>

      <FieldError error={error} />
    </>
  );
};

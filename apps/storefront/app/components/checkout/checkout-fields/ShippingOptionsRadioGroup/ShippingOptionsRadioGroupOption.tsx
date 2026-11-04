import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import { RadioGroupItem } from '@lambdacurry/forms/ui/radio-group';
import { formatPrice } from '@libs/util/prices';
import { StoreCartShippingOption, StoreRegion } from '@medusajs/types';
import clsx from 'clsx';
import { FC } from 'react';

export interface ShippingOptionsRadioGroupOptionProps {
  shippingOption: StoreCartShippingOption;
  region: StoreRegion;
  value?: string | null;
}

export const ShippingOptionsRadioGroupOption: FC<ShippingOptionsRadioGroupOptionProps> = ({
  shippingOption,
  region,
  value,
}) => {
  const isSelected = value === shippingOption.id;

  return (
    <div className="relative col-span-1">
      <label htmlFor={shippingOption.id} className="cursor-pointer">
        <div
          className={clsx(
            'group relative flex h-full flex-col justify-between rounded-lg border bg-white p-4 shadow-sm',
            'active:ring-primary-500 hover:border-gray-400 focus:outline-none active:ring-2',
            isSelected ? 'border-transparent' : 'border-gray-300',
          )}
        >
          <div className="flex justify-between gap-1">
            <div className="block text-sm font-bold text-gray-900">{shippingOption.name}</div>
            <RadioGroupItem
              id={shippingOption.id}
              value={shippingOption.id}
              className="text-primary-600 h-5 w-5 border-0"
              indicator={<CheckCircleIcon className="text-primary-600 h-5 w-5" aria-hidden="true" />}
            />
          </div>
          <div className="mt-6 flex items-end justify-between text-sm text-gray-500">
            <div>{formatPrice(shippingOption.amount, { currency: region.currency_code })}</div>
          </div>
          <div
            className={clsx(
              'pointer-events-none absolute -inset-px rounded-lg border-2 active:border',
              isSelected ? 'border-primary-500' : 'border-transparent',
            )}
            aria-hidden="true"
          />
        </div>
      </label>
    </div>
  );
};

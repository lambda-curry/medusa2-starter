import { FC } from 'react';
import { Description, Label, Radio } from '@headlessui/react';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import clsx from 'clsx';
import { formatPrice } from '@libs/util/prices';
import { StoreCartShippingOption, StoreRegion } from '@medusajs/types';

export interface ShippingOptionsRadioGroupOptionProps {
  shippingOption: StoreCartShippingOption;
  region: StoreRegion;
}

export const ShippingOptionsRadioGroupOption: FC<ShippingOptionsRadioGroupOptionProps> = ({
  shippingOption,
  region,
}) => (
  <Radio value={shippingOption.id} className={'relative col-span-1'}>
    {({ checked }) => (
      <div
        className={clsx(
          'group',
          checked ? 'border-transparent' : 'border-gray-300',
          'active:ring-primary-500 relative col-span-1 flex h-full cursor-pointer flex-col justify-between rounded-lg border bg-white p-4 shadow-sm focus:outline-none active:ring-2',
        )}
      >
        <div className="flex justify-between gap-1">
          <Label as="div" className="block text-sm font-bold text-gray-900">
            {shippingOption.name}
          </Label>

          <div>{checked ? <CheckCircleIcon className="text-primary-600 h-5 w-5" aria-hidden="true" /> : null}</div>
        </div>

        <Description as="div" className="mt-6 flex items-end justify-between text-sm text-gray-500">
          <div>
            {formatPrice(shippingOption.amount, {
              currency: region.currency_code,
            })}
          </div>
        </Description>

        <div
          className={clsx(
            checked ? 'border-primary-500' : 'border-transparent',
            'pointer-events-none absolute -inset-px rounded-lg border-2 active:border',
          )}
          aria-hidden="true"
        />
      </div>
    )}
  </Radio>
);

import { FC } from 'react';
import { Description, Label, Radio, RadioGroup } from '@headlessui/react';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import TruckIcon from '@heroicons/react/24/solid/TruckIcon';
import clsx from 'clsx';
import { TransitTimeTypeEnum } from '@utils/types';
import { formatPrice } from '@libs/util/prices';
import { Region } from '@libs/util/medusa';
import { ShippingOption } from '@markethaus/storefront-client';

export interface ShippingOptionsRadioGroupOptionProps {
  shippingOption: ShippingOption;
  region: Region;
}

const TransitTimeMap = {
  [TransitTimeTypeEnum.SAME_DAY]: 'Same Day',
  [TransitTimeTypeEnum.NEXT_DAY]: 'Next Day',
  [TransitTimeTypeEnum.ONE_TWO_DAYS]: '1&ndash;2 Days',
  [TransitTimeTypeEnum.THREE_FIVE_DAYS]: '3&ndash;5 Days',
  [TransitTimeTypeEnum.FIVE_SEVEN_DAYS]: '5&ndash;7 Days',
  [TransitTimeTypeEnum.ONE_TWO_WEEKS]: '1&ndash;2 Weeks',
  [TransitTimeTypeEnum.TWO_PLUS_WEEKS]: '2+ Weeks',
};

export const ShippingOptionsRadioGroupOption: FC<
  ShippingOptionsRadioGroupOptionProps
> = ({ shippingOption, region }) => (
  <Radio
    value={shippingOption.id}
    className={({ checked }) => clsx('relative col-span-1')}
  >
    {({ checked }) => (
      <div
        className={clsx(
          'group',
          checked ? 'border-transparent' : 'border-gray-300',
          'active:ring-primary-500 relative col-span-1 flex h-full cursor-pointer flex-col justify-between rounded-lg border bg-white p-4 shadow-sm focus:outline-none active:ring-2'
        )}
      >
        <div className="flex justify-between gap-1">
          <Label as="div" className="block text-sm font-bold text-gray-900">
            {shippingOption.name}
          </Label>

          <div>
            {checked ? (
              <CheckCircleIcon
                className="text-primary-600 h-5 w-5"
                aria-hidden="true"
              />
            ) : null}
          </div>
        </div>

        <Description
          as="div"
          className="mt-6 flex items-end justify-between text-sm text-gray-500"
        >
          <div>
            {formatPrice(shippingOption.amount, {
              currency: region.currency_code,
            })}
          </div>

          {shippingOption.transit_time && (
            <div className="flex items-center gap-1 text-xs">
              <span
                dangerouslySetInnerHTML={{
                  __html: TransitTimeMap[shippingOption.transit_time],
                }}
              />
              <TruckIcon className="h-5 w-5" />
            </div>
          )}
        </Description>

        <div
          className={clsx(
            checked ? 'border-primary-500' : 'border-transparent',
            'pointer-events-none absolute -inset-px rounded-lg border-2 active:border'
          )}
          aria-hidden="true"
        />
      </div>
    )}
  </Radio>
);

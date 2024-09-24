import { Label, Radio, RadioGroup } from '@headlessui/react';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import { ButtonLink } from '@components/buttons/ButtonLink';
import clsx from 'clsx';
import type { FC } from 'react';
import { useControlField } from 'remix-validated-form';
import { ShippingAddressRadioGroupOption } from './ShippingAddressRadioGroupOption';
import { Address, Customer } from '@marketplace/util/medusa';

export interface ShippingAddressRadioGroupProps {
  customer?: Customer | undefined;
}

export const ShippingAddressRadioGroup: FC<ShippingAddressRadioGroupProps> = ({
  customer,
}) => {
  const [value, setValue] = useControlField(
    'shippingAddressId',
    'checkoutAccountDetailsForm'
  );

  return (
    <>
      {!!customer?.shipping_addresses?.length && (
        <RadioGroup name="shippingAddressId" value={value} onChange={setValue}>
          <div className="xs:grid-cols-2 my-6 grid grid-cols-1 gap-4">
            {customer?.shipping_addresses.map((shippingAddress: Address) => (
              <ShippingAddressRadioGroupOption
                key={shippingAddress.id}
                shippingAddress={shippingAddress}
              />
            ))}

            <Radio value="new" className="col-span-1 col-start-1 sm:col-span-2">
              {({ checked }) => (
                <Label as="span">
                  <ButtonLink
                    className={clsx(
                      'inline-flex items-center border-2 border-transparent !text-sm'
                    )}
                  >
                    {checked && (
                      <CheckCircleIcon className="mr-1.5 inline-block h-5 w-5" />
                    )}
                    {!checked && (
                      <PlusCircleIcon className="mr-1.5 inline-block h-5 w-5" />
                    )}
                    <span>Use new address</span>
                  </ButtonLink>
                </Label>
              )}
            </Radio>
          </div>
        </RadioGroup>
      )}
    </>
  );
};

import { FC } from 'react';
import { useControlField } from 'remix-validated-form';
import { Label, Radio, RadioGroup } from '@headlessui/react';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import PlusCircleIcon from '@heroicons/react/24/outline/PlusCircleIcon';
import clsx from 'clsx';
import { ButtonLink } from '@components/buttons/ButtonLink';
import { PaymentMethodsRadioGroupOption } from './PaymentMethodsRadioGroupOption';
import { type PaymentMethod } from '@utils/types';

export interface PaymentMethodsRadioGroupProps {
  formId: string;
  paymentMethods: PaymentMethod[];
}

export const PaymentMethodsRadioGroup: FC<PaymentMethodsRadioGroupProps> = ({
  formId,
  paymentMethods,
}) => {
  const [value, setValue] = useControlField('paymentMethodId', formId);

  return (
    <RadioGroup name="paymentMethodId" value={value} onChange={setValue}>
      <div className="xs:grid-cols-2 my-6 grid grid-cols-1 gap-4">
        {paymentMethods.map(paymentMethod => (
          <PaymentMethodsRadioGroupOption
            key={paymentMethod.data.id}
            paymentMethod={paymentMethod}
          />
        ))}

        <Radio value="new" className="col-span-1 col-start-1 sm:col-span-2">
          {({ checked }) => (
            <Label as="div">
              <ButtonLink
                size="sm"
                className={clsx(
                  'inline-flex items-center border-2 border-transparent'
                )}
              >
                {checked && (
                  <CheckCircleIcon className="mr-1.5 inline-block h-5 w-5" />
                )}
                {!checked && (
                  <PlusCircleIcon className="mr-1.5 inline-block h-5 w-5" />
                )}
                <span>Use new payment method</span>
              </ButtonLink>
            </Label>
          )}
        </Radio>
      </div>
    </RadioGroup>
  );
};

import { Label, Radio, RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import type { FC } from 'react';

export interface ProductOptionSelectorProps {
  option: {
    title: string;
    id: string;
    values: { value: string; label: string; disabled?: boolean }[];
  };
  onChange?: (name: string, value: string) => void;
  value?: string;
}

export const ProductOptionSelectorRadio: FC<ProductOptionSelectorProps> = ({ option, onChange, value }) => {
  const handleChange = (name: string, value: string) => {
    if (onChange) onChange(name, value);
  };

  const filteredValues: { value: string; label?: string; disabled?: boolean }[] = option.values.filter(
    (productOptionValue, index, self) => self.findIndex((item) => item.value === productOptionValue.value) === index,
  );

  // Helper function to separate option value from price and format price info
  const formatOptionLabel = (label: string) => {
    // Check if the label contains a price (indicated by a dash followed by currency)
    if (label.includes(' - ')) {
      const [optionValue, priceInfo] = label.split(' - ');

      // Format price range (if it contains "to")
      if (priceInfo.includes(' to ')) {
        return {
          optionValue,
          priceInfo: priceInfo.replace(' to ', ' – '), // Use en dash for range
        };
      }

      // Handle discount case
      if (priceInfo.includes('(') && priceInfo.includes('% off)')) {
        const [price, discount] = priceInfo.split(' (');
        return {
          optionValue,
          price,
          discount: discount.replace(')', ''),
        };
      }

      return { optionValue, price: priceInfo };
    }
    return { optionValue: label, price: null };
  };

  return (
    <RadioGroup
      name={`options.${option.id}`}
      value={value}
      onChange={(changedValue) => handleChange(option.id, changedValue)}
    >
      <div className="grid grid-cols-1 gap-2">
        {filteredValues.map((optionValue, valueIndex) => {
          const { optionValue: displayValue, price, priceInfo, discount } = formatOptionLabel(optionValue.label || '');

          return (
            <Radio
              key={valueIndex}
              value={optionValue.value}
              disabled={optionValue.disabled}
              className={({ checked, disabled }) =>
                clsx(
                  'group',
                  checked ? 'ring-primary-300 ring-1 bg-highlight' : 'bg-white border-primary-300',
                  'active:ring-primary-300 relative col-span-1 flex h-full cursor-pointer flex-col justify-between rounded-lg border px-3 py-2 font-bold shadow-sm hover:bg-highlight/40 focus:outline-none',
                  disabled ? 'opacity-50' : '',
                )
              }
            >
              {({ checked }) => (
                <Label as="div" className="flex items-center w-full">
                  {/* Check icon on the left */}
                  <div className="flex-shrink-0 w-5 mr-2">
                    {checked && <CheckCircleIcon className="text-primary-600 h-5 w-5" aria-hidden="true" />}
                  </div>

                  {/* Option value in the middle */}
                  <div className="flex-grow">
                    <span className={clsx('text-base', checked ? 'text-primary-800' : 'text-gray-900')}>
                      {displayValue}
                    </span>
                    {optionValue.disabled && <span className="text-xs text-gray-500 ml-2">(not available)</span>}
                  </div>

                  {/* Price information on the right */}
                  {(price || priceInfo) && (
                    <div className="flex-shrink-0 text-right ml-1">
                      <span className="text-sm font-normal text-gray-500">{price || priceInfo}</span>
                      {discount && <span className="ml-1 text-xs font-medium text-green-600">{discount}</span>}
                    </div>
                  )}
                </Label>
              )}
            </Radio>
          );
        })}
      </div>
    </RadioGroup>
  );
};

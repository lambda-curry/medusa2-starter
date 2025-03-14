import { Label, Radio, RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import type { FC } from 'react';
import { formatPrice } from '@libs/util/prices';

export interface ProductOptionSelectorProps {
  option: {
    title: string;
    id: string;
    values: {
      value: string;
      minPrice?: number;
      maxPrice?: number;
      exactPrice?: number;
      discountPercentage?: number;
      disabled?: boolean;
    }[];
  };
  onChange?: (name: string, value: string) => void;
  value?: string;
  currencyCode: string;
}

export const ProductOptionSelectorRadio: FC<ProductOptionSelectorProps> = ({
  option,
  onChange,
  value,
  currencyCode,
}) => {
  const handleChange = (name: string, value: string) => {
    if (onChange) onChange(name, value);
  };

  // Filter unique values
  const uniqueValues = option.values.filter(
    (optionValue, index, self) => self.findIndex((item) => item.value === optionValue.value) === index,
  );

  // Sort values by price (low to high)
  const sortedValues = [...uniqueValues].sort((a, b) => {
    const aPrice = a.minPrice || a.exactPrice || 0;
    const bPrice = b.minPrice || b.exactPrice || 0;
    return aPrice - bPrice;
  });

  return (
    <RadioGroup
      name={`options.${option.id}`}
      value={value}
      onChange={(changedValue) => handleChange(option.id, changedValue)}
    >
      <div className="grid grid-cols-1 gap-2">
        {sortedValues.map((optionValue, valueIndex) => {
          // Format the price display
          let priceDisplay = '';
          let discountDisplay = '';

          if (optionValue.minPrice !== undefined && optionValue.maxPrice !== undefined) {
            if (optionValue.minPrice === optionValue.maxPrice) {
              // Single price
              priceDisplay = formatPrice(optionValue.minPrice, { currency: currencyCode });
            } else {
              // Price range
              priceDisplay = `${formatPrice(optionValue.minPrice, { currency: currencyCode })} – ${formatPrice(optionValue.maxPrice, { currency: currencyCode })}`;
            }
          } else if (optionValue.exactPrice !== undefined) {
            // Exact price
            priceDisplay = formatPrice(optionValue.exactPrice, { currency: currencyCode });

            // Format discount if available
            if (optionValue.discountPercentage) {
              discountDisplay = `${optionValue.discountPercentage}% off`;
            }
          }

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
                  {/* Option value on the left */}
                  <div className="flex-grow">
                    <span className={clsx('text-base', checked ? 'text-primary-800' : 'text-gray-900')}>
                      {optionValue.value}
                    </span>
                    {optionValue.disabled && <span className="text-xs text-gray-500 ml-2">(not available)</span>}
                  </div>

                  {/* Price information and check icon on the right */}
                  <div className="flex items-center">
                    {priceDisplay && (
                      <div className="text-right">
                        <span className="text-sm font-normal text-gray-500">{priceDisplay}</span>
                        {discountDisplay && (
                          <span className="ml-1 text-xs font-medium text-green-600">({discountDisplay})</span>
                        )}
                      </div>
                    )}
                    {checked && <CheckCircleIcon className="text-primary-600 h-5 w-5 ml-2" aria-hidden="true" />}
                  </div>
                </Label>
              )}
            </Radio>
          );
        })}
      </div>
    </RadioGroup>
  );
};

import { formatPrice } from '@libs/util/prices';
import type { ChangeEvent, FC } from 'react';
import { useRemixFormContext } from 'remix-hook-form';

export interface ProductOptionSelectorProps {
  option: {
    id: string;
    title: string;
    values: {
      value: string;
      minPrice?: number;
      maxPrice?: number;
      exactPrice?: number;
      discountPercentage?: number;
    }[];
  };
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  currencyCode: string;
}

export const ProductOptionSelectorSelect: FC<ProductOptionSelectorProps> = ({
  option,
  onChange,
  value,
  currencyCode,
}) => {
  const { register } = useRemixFormContext();
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(event);
  };

  const filteredValues = option.values.filter(
    (productOptionValue, index, self) => self.findIndex((item) => item.value === productOptionValue.value) === index,
  );

  // Sort values by price (low to high)
  const sortedValues = [...filteredValues].sort((a, b) => {
    const aPrice = a.minPrice ?? a.exactPrice ?? 0;
    const bPrice = b.minPrice ?? b.exactPrice ?? 0;
    return aPrice - bPrice;
  });

  // Format options with price information
  const formattedOptions = sortedValues.map((optionValue) => {
    let label = optionValue.value;

    // Add price information
    if (optionValue.minPrice !== undefined && optionValue.maxPrice !== undefined) {
      if (optionValue.minPrice === optionValue.maxPrice) {
        // Single price
        label += ` - ${formatPrice(optionValue.minPrice, { currency: currencyCode })}`;
      } else {
        // Price range
        label += ` - ${formatPrice(optionValue.minPrice, { currency: currencyCode })} – ${formatPrice(optionValue.maxPrice, { currency: currencyCode })}`;
      }
    } else if (optionValue.exactPrice !== undefined) {
      // Exact price
      label += ` - ${formatPrice(optionValue.exactPrice, { currency: currencyCode })}`;

      // Add discount if available
      if (optionValue.discountPercentage) {
        label += ` (${optionValue.discountPercentage}% off)`;
      }
    }

    return {
      value: optionValue.value,
      label,
    };
  });

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={option.id} className="text-sm font-medium text-gray-700">
        {option.title}
      </label>
      <select
        {...register(`options.${option.id}`)}
        id={option.id}
        className="form-select"
        defaultValue={value}
        // onChange={handleChange}
      >
        {formattedOptions.map((optValue, valueIndex) => (
          <option key={valueIndex} value={optValue.value}>
            {optValue.label || optValue.value}
          </option>
        ))}
      </select>
    </div>
  );

  // return (
  //   <FieldSelect
  //     name={`options.${option.id}`}
  //     label={option.title}
  //     options={[{ label: 'Select one', value: '' }, ...formattedOptions]}
  //     onChange={handleChange}
  //     inputProps={{ value }}
  //   />
  // );
};

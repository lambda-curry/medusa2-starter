import { FieldSelect } from '@app/components/common/forms/fields/FieldSelect';
import type { ChangeEvent, FC } from 'react';

export interface ProductOptionSelectorProps {
  option: {
    id: string;
    title: string;
    product_id: string;
    values: { value: string; label: string }[];
  };
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

export const ProductOptionSelectorSelect: FC<ProductOptionSelectorProps> = ({ option, onChange, value }) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(event);
  };

  const filteredValues: {
    value: string;
    label?: string;
  }[] = option.values.filter(
    (productOptionValue, index, self) => self.findIndex((item) => item.value === productOptionValue.value) === index,
  );

  return (
    <FieldSelect
      name={`options.${option.id}`}
      label={option.title}
      options={[{ label: 'Select one', value: '' }, ...filteredValues.map(({ value, label }) => ({ label, value }))]}
      onChange={handleChange}
      inputProps={{ value }}
    />
  );
};

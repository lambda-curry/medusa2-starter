import { ChangeEvent, FC } from 'react';
import { useRemixFormContext } from 'remix-hook-form';

export interface ProductOptionSelectorProps {
  option: {
    id: string;
    title: string;
    values: { value: string; label: string; disabled?: boolean }[];
  };
  value: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
}

export const ProductOptionSelectorSelect: FC<ProductOptionSelectorProps> = ({ option, value, onChange }) => {
  const { register } = useRemixFormContext();

  const filteredValues = (option.values ?? []).filter(
    (optValue, index, self) => self.findIndex((item) => item.value === optValue.value) === index,
  );

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
        onChange={onChange}
      >
        {filteredValues.map((optValue, valueIndex) => (
          <option key={valueIndex} value={optValue.value} disabled={optValue.disabled}>
            {optValue.disabled
              ? `${optValue.label || optValue.value} (not available)`
              : optValue.label || optValue.value}
          </option>
        ))}
      </select>
    </div>
  );
};

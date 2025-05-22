import {
  Controller,
  type ControllerProps,
  type FieldValues,
  type Path,
  type RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import { SearchableSelect, type Props as SearchableSelectProps } from '../Field/SearchableSelect';

type Props<T extends FieldValues> = SearchableSelectProps &
  Omit<ControllerProps, 'render' | 'control'> & {
    name: Path<T>;
  };

export const ControlledSearchableSelect = <T extends FieldValues>({ name, rules, onChange, ...props }: Props<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller<T>
      control={control}
      name={name}
      rules={rules as Omit<RegisterOptions<T, Path<T>>, 'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>}
      render={({ field }) => (
        <SearchableSelect
          {...field}
          {...props}
          onChange={(a, b) => {
            field.onChange(a, b);
            onChange?.(a, b);
          }}
        />
      )}
    />
  );
};

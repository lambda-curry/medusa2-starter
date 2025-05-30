import {
  Controller,
  type ControllerProps,
  type FieldValues,
  type Path,
  type RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import { Select, type Props as SelectProps } from '../Field/Select';

type Props<T> = SelectProps &
  Omit<ControllerProps, 'render'> & {
    name: Path<T>;
    children: React.ReactNode;
    onBlur?: () => void;
    onChange?: (value: unknown) => void;
  };

export const ControlledSelect = <T extends FieldValues>({
  name,
  rules,
  children,
  onChange,
  onBlur,
  ...props
}: Props<T>) => {
  const { control } = useFormContext<T>();
  return (
    <Controller<T>
      control={control}
      name={name}
      rules={rules as Omit<RegisterOptions<T, Path<T>>, 'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>}
      render={({ field }) => {
        const handleChange = (value: unknown) => {
          if (typeof onChange === 'function') onChange(value);
          field.onChange(value);
        };

        const handleBlur = () => {
          if (typeof onBlur === 'function') onBlur();
          field.onBlur();
        };

        return (
          <Select {...({ ...field, ...props, onBlur: handleBlur, onValueChange: handleChange } as SelectProps)}>
            {children}
          </Select>
        );
      }}
    />
  );
};

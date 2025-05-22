import {
  Controller,
  type ControllerProps,
  type FieldValues,
  type Path,
  type RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import { FieldCheckbox, type FieldCheckboxProps } from '../Field/FieldCheckbox';

type Props<T extends FieldValues> = Omit<FieldCheckboxProps, 'name'> &
  Omit<ControllerProps, 'render'> & {
    name: Path<T>;
    rules?: Omit<RegisterOptions<T, Path<T>>, 'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  };

export const ControlledCheckbox = <T extends FieldValues>({ name, rules, onChange, ...props }: Props<T>) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules as Omit<RegisterOptions<T, Path<T>>, 'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>}
      render={({ field }) => (
        <FieldCheckbox
          {...field}
          {...props}
          formErrors={errors}
          checked={field.value}
          onChange={(checked) => {
            if (onChange) onChange(checked);
            field.onChange(checked);
          }}
        />
      )}
    />
  );
};

import { useField } from 'remix-validated-form';
import { FieldProps } from './Field.types';
import { FieldErrorProps } from './FieldError';
import { FieldLabelProps } from './FieldLabel';
import { FieldWrapperProps } from './FieldWrapper';

export const useCombinedFieldProps = <T>(props: FieldProps<T>) => {
  const { getInputProps, error } = useField(props.name, props.fieldOptions);
  const fieldError = props.error || error;
  const {
    id,
    type,
    name,
    value,
    placeholder,
    autoComplete,
    label,
    onChange,
    onBlur,
    defaultValue,
    optional,
    labelComponent,
    errorComponent,
    className,
    labelProps,
    inputProps,
    inputRef,
    errorProps,
    fieldOptions,
    ...restProps
  } = props as any;

  const combinedWrapperProps: FieldWrapperProps = {
    name,
    className,
    error: fieldError,
    ...restProps,
  };

  const combinedInputProps: T & {
    type: string;
    error?: string;
  } = {
    ref: inputRef,
    ...getInputProps({
      id: id || name,
      type,
      name,
      value,
      onChange,
      onBlur,
      placeholder,
      autoComplete,
      defaultValue,
      ...inputProps,
    }),
    error: fieldError,
  };

  const combinedLabelProps: FieldLabelProps = {
    htmlFor: id || name,
    children: label,
    labelComponent,
    error: fieldError,
    optional,
    ...labelProps,
  };

  const combinedErrorProps: FieldErrorProps = {
    error: fieldError,
    errorComponent,
  };

  return {
    error: fieldError,
    inputProps: combinedInputProps,
    labelProps: combinedLabelProps,
    errorProps: combinedErrorProps,
    wrapperProps: combinedWrapperProps,
  };
};

import { CSSProperties, forwardRef } from 'react';
import { Select, SelectProps } from '../inputs/Select';
import { FieldLabel } from './FieldLabel';
import { FieldWrapper } from './FieldWrapper';
import { FieldError } from './FieldError';
import { FieldProps } from './Field.types';
import { useCombinedFieldProps } from './Field.helpers';
import { FieldInput } from './FieldInput';
import clsx from 'clsx';

export interface FieldSelectProps extends Omit<FieldProps<SelectProps>, 'type'> {
  options: SelectProps['options'];
}

export const FieldSelect = forwardRef<HTMLDivElement, FieldSelectProps>(
  ({ options, children, inputComponent, prefix, ...props }, ref) => {
    const { wrapperProps, labelProps, inputProps, errorProps } = useCombinedFieldProps<SelectProps>({
      type: 'select',
      fieldOptions: {
        validationBehavior: {
          initial: 'onSubmit',
          whenTouched: 'onSubmit',
        },
        ...props.fieldOptions,
      },
      ...props,
    });

    return (
      <FieldWrapper ref={ref} {...wrapperProps}>
        <FieldLabel {...labelProps} />

        <FieldInput
          className={clsx({
            'relative flex items-center': prefix,
          })}
        >
          {prefix && <span className="absolute left-4">{prefix}</span>}
          {!inputComponent && (
            <Select {...inputProps} className={clsx({ '!pl-12': prefix }, inputProps.className)} options={options}>
              {children}
            </Select>
          )}
          {inputComponent && inputComponent({ ...inputProps, options })}
        </FieldInput>

        <FieldError {...errorProps} />
      </FieldWrapper>
    );
  },
);

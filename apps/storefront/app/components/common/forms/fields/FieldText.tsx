import clsx from 'clsx';
import { type ReactNode, type HTMLAttributes, forwardRef, type ReactElement } from 'react';
import { Input, type InputProps } from '../inputs/Input';
import { useCombinedFieldProps } from './Field.helpers';
import type { FieldProps } from './Field.types';
import { FieldError } from './FieldError';
import { FieldInput } from './FieldInput';
import { FieldLabel } from './FieldLabel';
import { FieldWrapper } from './FieldWrapper';

export const FieldPrefix = ({ children }: { children: ReactNode }) => {
  return (
    <span className="field__prefix -mr-2.5 flex items-center whitespace-nowrap rounded-md bg-gray-50 px-2.5 pr-5 text-base font-bold text-gray-500 shadow-sm">
      {children}
    </span>
  );
};

export const FieldSuffix = ({ children }: { children: ReactNode }) => {
  return (
    <span className="field__suffix -ml-2.5 flex items-center whitespace-nowrap rounded-md bg-gray-50 px-2.5 pl-5 text-base font-bold text-gray-500 shadow-sm">
      {children}
    </span>
  );
};

export type FieldTextProps = FieldProps<InputProps> & {
  prefix?: ReactNode;
  suffix?: ReactNode;
  fieldTextProps?: HTMLAttributes<HTMLDivElement>;
};

export const FieldText = forwardRef<HTMLDivElement, FieldTextProps>(
  ({ inputComponent, prefix, suffix, fieldTextProps, ...props }, ref) => {
    const { wrapperProps, labelProps, inputProps, errorProps } = useCombinedFieldProps<InputProps>({
      type: 'text',
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
          type={inputProps.type}
          className={clsx(
            {
              'relative flex items-stretch': prefix || suffix,
              'field__input--with-prefix': prefix,
              'field__input--with-suffix': suffix,
            },
            fieldTextProps?.className,
          )}
          {...fieldTextProps}
        >
          {prefix && <FieldPrefix>{prefix}</FieldPrefix>}
          {!inputComponent && (
            <Input
              {...inputProps}
              disabled={inputProps.disabled}
              className={clsx(inputProps.className, {
                'z-10': prefix || suffix,
                'rounded-l-none': prefix,
                'rounded-r-none': suffix,
                'opacity-50': inputProps.disabled,
                'cursor-not-allowed': inputProps.disabled,
              })}
            />
          )}
          {!!inputComponent && inputComponent(inputProps)}
          {suffix && <FieldSuffix>{suffix}</FieldSuffix>}
        </FieldInput>

        <FieldError {...errorProps} />
      </FieldWrapper>
    );
  },
);

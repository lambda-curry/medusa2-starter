import { Checkbox as MedusaCheckbox } from '@medusajs/ui';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import { Label } from './Label';
import type { BasicFieldProps } from './types';

export type CheckedState = boolean | 'indeterminate';
export type FieldCheckboxProps = BasicFieldProps & {
  checked?: CheckedState;
  onChange?: (checked: CheckedState) => void;
};

export const FieldCheckbox: React.FC<FieldCheckboxProps> = forwardRef<HTMLButtonElement, FieldCheckboxProps>(
  ({ label, labelClassName, labelTooltip, wrapperClassName, errorClassName, formErrors, onChange, ...props }, ref) => {
    return (
      <FieldWrapper<FieldCheckboxProps>
        wrapperClassName={wrapperClassName}
        errorClassName={errorClassName}
        formErrors={formErrors}
        {...props}
      >
        {(fieldProps) => (
          <div className="flex items-center">
            <MedusaCheckbox
              {...fieldProps}
              ref={ref}
              checked={props.checked}
              onChange={(e) => {}}
              onCheckedChange={(checked) => {
                onChange?.(checked);
              }}
            />

            {label && (
              <Label
                htmlFor={props.name}
                onClick={() => {
                  onChange?.(!props.checked);
                }}
                className={clsx('ml-2 !mb-0 font-normal [&>label]:!cursor-pointer', labelClassName)}
              >
                {label}
              </Label>
            )}
          </div>
        )}
      </FieldWrapper>
    );
  },
);

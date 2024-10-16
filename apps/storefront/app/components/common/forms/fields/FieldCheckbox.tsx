import { forwardRef } from 'react';
import { InputCheckbox, InputCheckboxProps } from '../inputs/InputCheckbox';
import { FieldLabel } from './FieldLabel';
import { FieldWrapper } from './FieldWrapper';
import { FieldError } from './FieldError';
import { FieldProps } from './Field.types';
import { useCombinedFieldProps } from './Field.helpers';
import { FieldInput } from './FieldInput';

export interface FieldCheckboxProps extends FieldProps<InputCheckboxProps> {}

export const FieldCheckbox = forwardRef<HTMLDivElement, FieldCheckboxProps>(({ inputComponent, ...props }, ref) => {
  const { wrapperProps, labelProps, inputProps, errorProps } = useCombinedFieldProps({
    type: 'checkbox',
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
      <div className="flex items-center">
        <FieldInput className="!mt-0">
          {!inputComponent && <InputCheckbox {...inputProps} />}
          {!!inputComponent && inputComponent(inputProps)}
        </FieldInput>

        <FieldLabel {...labelProps} className="!mb-0 ml-2 font-normal" />
      </div>

      <FieldError {...errorProps} />
    </FieldWrapper>
  );
});

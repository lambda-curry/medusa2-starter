import { forwardRef } from 'react';
import { Textarea, TextareaProps } from '../inputs/Textarea';
import { FieldLabel } from './FieldLabel';
import { FieldWrapper } from './FieldWrapper';
import { FieldError } from './FieldError';
import { FieldProps } from './Field.types';
import { useCombinedFieldProps } from './Field.helpers';
import { FieldInput } from './FieldInput';

export interface FieldTextareaProps extends FieldProps<TextareaProps> {}

export const FieldTextarea = forwardRef<HTMLDivElement, FieldTextareaProps>(({ inputComponent, ...props }, ref) => {
  const { wrapperProps, labelProps, inputProps, errorProps } = useCombinedFieldProps<TextareaProps>(props);

  return (
    <FieldWrapper ref={ref} {...wrapperProps}>
      <FieldLabel {...labelProps} />

      <FieldInput type={inputProps.type}>
        {!inputComponent && <Textarea {...inputProps} />}
        {!!inputComponent && inputComponent(inputProps)}
      </FieldInput>

      <FieldError {...errorProps} />
    </FieldWrapper>
  );
});

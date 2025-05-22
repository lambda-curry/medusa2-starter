import { DatePicker } from '@medusajs/ui';
import { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import type { BasicFieldProps, DatePickerProps } from './types';

export type Props = DatePickerProps & BasicFieldProps;

const Wrapper = FieldWrapper<Props>;

export const DatePickerInput: React.FC<Props> = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <Wrapper {...props}>{(inputProps) => <DatePicker {...{ ...inputProps, ref }} />}</Wrapper>;
});

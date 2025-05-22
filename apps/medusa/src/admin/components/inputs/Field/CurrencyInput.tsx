import { CurrencyInput as MedusaCurrencyInput } from '@medusajs/ui';
import { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import type { BasicFieldProps, MedusaCurrencyInputProps } from './types';

export type Props = MedusaCurrencyInputProps & BasicFieldProps;

const Wrapper = FieldWrapper<Props>;

export const CurrencyInput: React.FC<Props> = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <Wrapper {...props}>{(inputProps) => <MedusaCurrencyInput {...inputProps} ref={ref} />}</Wrapper>
));

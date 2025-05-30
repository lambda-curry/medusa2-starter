import { Input as MedusaInput } from '@medusajs/ui';
import { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import type { BasicFieldProps, MedusaInputProps } from './types';

export type Props = MedusaInputProps & BasicFieldProps;

const Wrapper = FieldWrapper<Props>;

export const Input: React.FC<Props> = forwardRef<HTMLInputElement, Props>((props, ref) => (
  <Wrapper {...props}>{(inputProps) => <MedusaInput {...inputProps} ref={ref} />}</Wrapper>
));

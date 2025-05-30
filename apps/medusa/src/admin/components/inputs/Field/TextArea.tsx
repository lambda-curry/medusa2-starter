import { Textarea } from '@medusajs/ui';
import { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import type { BasicFieldProps, TextAreaProps } from './types';

export type Props = TextAreaProps & BasicFieldProps;

const Wrapper = FieldWrapper<Props>;

export const TextArea: React.FC<Props> = forwardRef((props, ref) => (
  <Wrapper {...props}>{(inputProps) => <Textarea {...inputProps} ref={ref} />}</Wrapper>
));

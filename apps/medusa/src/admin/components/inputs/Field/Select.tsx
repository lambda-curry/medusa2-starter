import { Select as MedusaSelect } from '@medusajs/ui';
import { forwardRef } from 'react';
import { FieldWrapper } from './FieldWrapper';
import type { BasicFieldProps, SelectProps } from './types';

export type Props = SelectProps & BasicFieldProps;

const Wrapper = FieldWrapper<Props>;

export const Select: React.FC<Props> = forwardRef<unknown, Props>((props, ref) => {
  return (
    <Wrapper {...props}>
      {(inputProps) => <MedusaSelect {...{ ...inputProps, ref }}>{props.children}</MedusaSelect>}
    </Wrapper>
  );
});

export const SelectTrigger = MedusaSelect.Trigger;

export const SelectValue = MedusaSelect.Value;

export const SelectContent = MedusaSelect.Content;

export const SelectItem = MedusaSelect.Item;

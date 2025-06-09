/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { type LegacyRef, forwardRef } from 'react';
import type { GroupBase, SelectInstance } from 'react-select';
import Select from '../../molecules/Select/SearchableSelect';
import { FieldWrapper } from './FieldWrapper';
import type { BasicFieldProps, SearchableSelectProps } from './types';

export type Props = SearchableSelectProps & BasicFieldProps;

const Wrapper = FieldWrapper<Props>;

export const SearchableSelect: React.FC<Props> = forwardRef<HTMLSelectElement, Props>((props, ref) => {
  return (
    <Wrapper {...props}>
      {(inputProps) => (
        <Select
          {...inputProps}
          ref={ref as unknown as LegacyRef<SelectInstance<unknown, boolean, GroupBase<unknown>>>}
        />
      )}
    </Wrapper>
  );
}) as unknown as React.FC<Props>;

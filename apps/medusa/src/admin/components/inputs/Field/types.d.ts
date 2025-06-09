import type { RefAttributes } from 'react';
import type { Props, SelectInstance } from 'react-select';
import type { CreatableProps } from 'react-select/creatable';

export interface BasicFieldProps {
  label?: ReactNode;
  labelClassName?: string;
  labelTooltip?: ReactNode;
  wrapperClassName?: string;
  errorClassName?: string;
  formErrors?: { [x: string]: unknown };
  name?: string;
}

export interface FieldWrapperProps<T> extends BasicFieldProps, T {
  children: (args: T) => ReactNode;
}

export type TextAreaProps = Omit<
  React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>,
  'ref'
> &
  React.RefAttributes<HTMLTextAreaElement>;

interface RawCurrencyInputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Primitive>, 'prefix' | 'suffix' | 'size'>,
    VariantProps<typeof currencyInputVariants> {
  symbol: string;
  code: string;
}

export type MedusaCurrencyInputProps = RawCurrencyInputProps & React.RefAttributes<HTMLInputElement>;

export type MedusaInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: 'small' | 'base';
};

interface PickerProps extends CalendarProps {
  /**
   * The class name to apply on the date picker.
   */
  className?: string;
  /**
   * Whether the date picker's input is disabled.
   */
  disabled?: boolean;
  /**
   * Whether the date picker's input is required.
   */
  required?: boolean;
  /**
   * The date picker's placeholder.
   */
  placeholder?: string;
  /**
   * The date picker's size.
   */
  size?: 'small' | 'base';
  /**
   * Whether to show a time picker along with the date picker.
   */
  showTimePicker?: boolean;
  /**
   * Translation keys for the date picker. Use this to localize the date picker.
   */
  translations?: Translations;
  id?: string;
  'aria-invalid'?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-required'?: boolean;
}

type DatePickerValueProps = {
  defaultValue?: Date | null;
  value?: Date | null;
  onChange?: (value: Date | null) => void;
  isDateUnavailable?: (date: Date) => boolean;
  minValue?: Date;
  maxValue?: Date;
  shouldCloseOnSelect?: boolean;
  granularity?: Granularity;
  size?: 'base' | 'small';
  className?: string;
  modal?: boolean;
};
interface DatePickerProps
  extends Omit<BaseDatePickerProps<CalendarDateTime | CalendarDate>, keyof DatePickerValueProps>,
    DatePickerValueProps {}

// export type DatePickerProps = (
//   | {
//       mode?: 'single';
//       presets?: DatePreset[];
//       defaultValue?: Date;
//       value?: Date;
//       onChange?: (date: Date | null) => void;
//     }
//   | {
//       mode: 'range';
//       presets?: DateRangePreset[];
//       defaultValue?: DateRange;
//       value?: DateRange;
//       onChange?: (dateRange: DateRange | null) => void;
//     }
// ) &
//   PickerProps;

export type SearchableSelectProps = Props<Option, IsMulti, Group> &
  RefAttributes<SelectInstance<Option, IsMulti, Group>>;

export type CreatableSelectProps = CreatableProps<Option, IsMulti, Group> &
  RefAttributes<SelectInstance<Option, IsMulti, Group>>;

interface SelectProps extends React.ComponentPropsWithRef {
  size?: 'base' | 'small';
  children?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
  dir?: Direction;
  name?: string;
  autoComplete?: string;
  disabled?: boolean;
  required?: boolean;
}

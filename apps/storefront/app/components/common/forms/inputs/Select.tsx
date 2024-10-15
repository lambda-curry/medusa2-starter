import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react';
import clsx from 'clsx';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: { label: ReactNode; value: string; disabled?: boolean }[];
  error?: string | null;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, children, className, error, ...props }, ref) => (
    <select
      ref={ref}
      {...props}
      className={clsx(
        'focus:ring-primary-500 focus:border-primary-500 block h-12 w-full cursor-pointer rounded-md border border-gray-300 pl-3 pr-10 text-sm shadow-sm outline-none focus:ring-1',
        { 'border-red-600': error },
        className,
      )}
    >
      {options &&
        options.map((option, optionIndex) => (
          <option key={optionIndex} value={option?.value} disabled={option.disabled}>
            {option?.label}
          </option>
        ))}

      {children}
    </select>
  ),
);

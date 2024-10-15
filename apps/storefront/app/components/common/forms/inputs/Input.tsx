import clsx from 'clsx';
import { type InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  step?: string;
  error?: string | null;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={clsx(
      'block h-12 w-full rounded-md border-none px-3 outline-none focus:ring-0',
      { 'bg-gray-100': props.readOnly },
      { 'border-red-600': !!error },
      className,
    )}
  />
));

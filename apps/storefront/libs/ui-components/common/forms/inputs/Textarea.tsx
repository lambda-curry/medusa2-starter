import clsx from 'clsx';
import { type InputHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={4}
    {...props}
    className={clsx(
      'focus:ring-primary-500 focus:border-primary-500 block w-full rounded-md border-0 border-gray-300 px-3 py-3 text-sm shadow-sm outline-none focus:ring-0',
      { 'border-red-600': !!error },
      className,
    )}
  />
));

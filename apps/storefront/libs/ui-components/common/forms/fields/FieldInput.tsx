import clsx from 'clsx';
import { type FC, type HTMLAttributes } from 'react';

export interface FieldInputProps extends HTMLAttributes<HTMLDivElement> {
  type?: string;
}

export const FieldInput: FC<FieldInputProps> = ({ type = '', className, ...props }) => (
  <div
    {...props}
    className={clsx(
      'field__input rounded-md shadow-sm outline-none focus-within:ring-1',
      {
        [`field__input--${type}`]: type,
        'border border-gray-300': type !== 'hidden',
      },
      className,
    )}
  />
);

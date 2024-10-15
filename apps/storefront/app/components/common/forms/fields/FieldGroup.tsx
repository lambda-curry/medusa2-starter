import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface FieldGroupProps extends HTMLAttributes<HTMLDivElement> {}

export const FieldGroup: FC<FieldGroupProps> = ({ className, ...props }) => (
  <div className={clsx('field-group my-6 grid grid-cols-12 gap-x-3 gap-y-4 sm:gap-x-4', className)} {...props} />
);

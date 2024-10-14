import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface GridProps extends HTMLAttributes<HTMLElement> {}

export const Grid: FC<GridProps> = ({ className, ...props }) => (
  <div className={clsx('grid grid-cols-12 gap-3 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10', className)} {...props} />
);

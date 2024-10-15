import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface GridColumnProps extends HTMLAttributes<HTMLElement> {}

export const GridColumn: FC<GridColumnProps> = ({ className, ...props }) => (
  <div className={clsx('col-span-12', className)} {...props} />
);

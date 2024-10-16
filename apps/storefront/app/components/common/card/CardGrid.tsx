import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardGridProps extends HTMLAttributes<HTMLDivElement> {}

export const CardGrid: FC<CardGridProps> = ({ className, ...props }) => (
  <div
    className={clsx(
      'card__grid my-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10',
      className,
    )}
    {...props}
  />
);

import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardDateProps extends HTMLAttributes<HTMLSpanElement> {}

export const CardDate: FC<CardDateProps> = ({ className, ...props }) => (
  <span className={clsx('card__date text-right text-xs', className)} {...props} />
);

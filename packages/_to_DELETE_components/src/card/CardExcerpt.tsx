import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardExcerptProps extends HTMLAttributes<HTMLDivElement> {}

export const CardExcerpt: FC<CardExcerptProps> = ({ className, ...props }) => (
  <div className={clsx('card__excerpt line-clamp-4 leading-6', className)} {...props} />
);

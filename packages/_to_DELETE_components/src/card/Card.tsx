import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardProps extends HTMLAttributes<HTMLElement> {}

export const Card: FC<CardProps> = ({ className, ...props }) => (
  <article className={clsx('card flex flex-col rounded bg-white shadow-md', className)} {...props} />
);

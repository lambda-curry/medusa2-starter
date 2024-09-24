import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent: FC<CardContentProps> = ({ className, ...props }) => (
  <div
    className={clsx('card__content prose flex flex-grow flex-col justify-between px-6 py-4', className)}
    {...props}
  />
);

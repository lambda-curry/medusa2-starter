import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardHeaderProps extends HTMLAttributes<HTMLElement> {}

export const CardHeader: FC<CardHeaderProps> = ({ className, ...props }) => (
  <header
    className={clsx('card__header flex w-full flex-grow-0 items-center justify-between self-start', className)}
    {...props}
  />
);

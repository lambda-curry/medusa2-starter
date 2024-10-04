import { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface CardFooterProps extends HTMLAttributes<HTMLElement> {}

export const CardFooter: FC<CardFooterProps> = ({ className, ...props }) => (
  <footer className={clsx('card__footer mt-16 flex-grow-0 text-sm', className)} {...props} />
);

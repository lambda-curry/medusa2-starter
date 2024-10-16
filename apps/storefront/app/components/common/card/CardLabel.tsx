import { FC, PropsWithChildren } from 'react';
import clsx from 'clsx';

export interface CardLabelProps {
  className?: string;
}

export const CardLabel: FC<PropsWithChildren<CardLabelProps>> = ({ className, ...props }) => (
  <span
    className={clsx(
      'card__label rounded-full bg-gray-100 px-2 py-1 text-xs font-medium uppercase tracking-wider text-gray-500 no-underline',
      className,
    )}
    {...props}
  />
);

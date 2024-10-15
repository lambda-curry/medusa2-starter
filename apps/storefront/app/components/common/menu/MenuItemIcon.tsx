import type { FC, HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface MenuItemIconProps extends HTMLAttributes<SVGElement | HTMLElement> {
  icon: FC<HTMLAttributes<SVGElement | HTMLElement>>;
}

export const MenuItemIcon: FC<MenuItemIconProps> = ({ icon: Icon, className, ...props }) => (
  <Icon className={clsx('text-primary-500 h-5 w-5', className)} aria-hidden={true} {...props} />
);

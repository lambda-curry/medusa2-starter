import type { ElementType, FC } from 'react';
import { MenuItem as HeadlessMenuItem, type MenuItemProps as HeadlessMenuItemProps } from '@headlessui/react';
import clsx from 'clsx';

export interface MenuItemRenderProps {
  active: boolean;
  disabled: boolean;
  close: () => void;
  className?: string;
}

export type MenuItemProps = HeadlessMenuItemProps<ElementType> & {
  item: (menuItemProps: MenuItemRenderProps) => JSX.Element;
};

export const MenuItem: FC<MenuItemProps> = ({ item, ...props }) => (
  <HeadlessMenuItem as="li" className="py-1 first:pt-0 last:pb-0" {...props}>
    {(menuItemProps: { active: boolean; disabled: boolean; close: () => void }) =>
      item({
        className: clsx('group flex gap-2 w-full items-center rounded-md p-2 text-sm', {
          'bg-primary-50 text-primary-700': menuItemProps.active,
          'text-gray-900': !menuItemProps.active,
        }),
        ...menuItemProps,
      })
    }
  </HeadlessMenuItem>
);

import type { ElementType, FC, PropsWithChildren } from 'react';
import { Fragment } from 'react';
import {
  MenuItem as HeadlessMenuItem,
  type MenuItemsProps as HeadlessMenuItemsProps,
  Transition,
} from '@headlessui/react';
import clsx from 'clsx';

export type MenuItemsProps = HeadlessMenuItemsProps<ElementType> & {
  position?:
    | 'top'
    | 'top-left'
    | 'top-right'
    | 'bottom'
    | 'bottom-left'
    | 'bottom-right'
    | 'left'
    | 'left-top'
    | 'left-bottom'
    | 'right'
    | 'right-top'
    | 'right-bottom';
};

export const MenuItems: FC<PropsWithChildren<MenuItemsProps>> = ({ position, className, ...props }) => (
  <Transition
    as={Fragment}
    enter="transition ease-out duration-100"
    enterFrom="transform opacity-0 scale-95"
    enterTo="transform opacity-100 scale-100"
    leave="transition ease-in duration-75"
    leaveFrom="transform opacity-100 scale-100"
    leaveTo="transform opacity-0 scale-95"
  >
    <HeadlessMenuItem
      as="ul"
      className={clsx(
        'absolute z-50 max-h-80 w-48 divide-y divide-gray-100 overflow-y-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
        {
          'position-top': position === 'top',
          'position-top-right': position === 'top-right',
          'position-top-left': position === 'top-left',
          'position-bottom': position === 'bottom',
          'position-bottom-left': position === 'bottom-left',
          'position-bottom-right': position === 'bottom-right',
          'position-left': position === 'left',
          'position-left-top': position === 'left-top',
          'position-left-bottom': position === 'left-bottom',
          'position-right': position === 'right',
          'position-right-top': position === 'right-top',
          'position-right-bottom': position === 'right-bottom',
        },
        className,
      )}
      {...props}
    />
  </Transition>
);

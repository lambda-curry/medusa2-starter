import { FC, PropsWithChildren } from 'react';
import { TabList as HeadlessTabList } from '@headlessui/react';
import clsx from 'clsx';

export interface TabListProps {
  className?: string;
}

export const TabList: FC<PropsWithChildren<TabListProps>> = ({ className, ...props }) => (
  <HeadlessTabList
    className={clsx(
      'bg-primary-50 mb-2 inline-flex w-auto max-w-full snap-x gap-0.5 overflow-auto rounded-full px-2 py-1.5',
      className,
    )}
    {...props}
  />
);

import type { ElementType, FC, PropsWithChildren } from 'react';
import { Menu as HeadlessMenu, type MenuButtonProps as HeadlessMenuButtonProps } from '@headlessui/react';

export type MenuButtonProps = HeadlessMenuButtonProps<ElementType>;

export const MenuButton: FC<PropsWithChildren> = (props) => <HeadlessMenu.Button as="div" {...props} />;

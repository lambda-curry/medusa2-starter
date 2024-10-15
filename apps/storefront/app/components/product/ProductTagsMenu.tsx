import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { NavLink } from '@remix-run/react';
import clsx from 'clsx';
import type { FC } from 'react';
import { Button } from '@app/components/common/buttons/Button';
import { Menu } from '@app/components/common/menu/Menu';
import { MenuButton } from '@app/components/common/menu/MenuButton';
import { MenuItem } from '@app/components/common/menu/MenuItem';
import { MenuItems } from '@app/components/common/menu/MenuItems';
import { StoreProductTag } from '@medusajs/types';

export interface ProductTagsMenuProps {
  tags?: StoreProductTag[];
}

export const ProductTagsMenu: FC<ProductTagsMenuProps> = ({ tags }) => {
  if (!tags?.length) return null;

  return (
    <Menu>
      <MenuButton>
        <Button size="sm">
          <span>Tags</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </MenuButton>
      <MenuItems className="position-bottom-right">
        {tags.map((tag) => (
          <MenuItem
            key={tag.id}
            item={(itemProps) => (
              <NavLink
                to={`/products/tags/${tag.value}/${tag.id}`}
                className={({ isActive }) => clsx({ 'text-primary-700 font-bold': isActive }, itemProps.className)}
              >
                {tag.value}
              </NavLink>
            )}
          />
        ))}
      </MenuItems>
    </Menu>
  );
};

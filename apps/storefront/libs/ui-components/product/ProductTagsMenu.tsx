import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { NavLink } from '@remix-run/react';
import clsx from 'clsx';
import type { FC } from 'react';
import { Button } from '@components/buttons/Button';
import { Menu } from '@components/menu/Menu';
import { MenuButton } from '@components/menu/MenuButton';
import { MenuItem } from '@components/menu/MenuItem';
import { MenuItems } from '@components/menu/MenuItems';
import { ProductTag } from '@libs/util/medusa';

export interface ProductTagsMenuProps {
  tags?: ProductTag[];
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
        {tags.map(tag => (
          <MenuItem
            key={tag.id}
            item={itemProps => (
              <NavLink
                to={`/products/tags/${tag.value}/${tag.id}`}
                className={({ isActive }) =>
                  clsx(
                    { 'text-primary-700 font-bold': isActive },
                    itemProps.className
                  )
                }
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

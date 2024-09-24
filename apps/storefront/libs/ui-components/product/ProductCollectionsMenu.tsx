import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';

import { NavLink } from '@remix-run/react';
import clsx from 'clsx';
import type { FC } from 'react';
import { Button } from '@components/buttons/Button';
import { Menu } from '@components/menu/Menu';
import { MenuButton } from '@components/menu/MenuButton';
import { MenuItem } from '@components/menu/MenuItem';
import { MenuItems } from '@components/menu/MenuItems';
import { ProductCollection } from '@marketplace/util/medusa';

export interface ProductCollectionsMenuProps {
  collections?: ProductCollection[];
}

export const ProductCollectionsMenu: FC<ProductCollectionsMenuProps> = ({
  collections,
}) => {
  if (!collections?.length) return null;

  return (
    <Menu>
      <MenuButton>
        <Button size="sm">
          <span>Collections</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </MenuButton>
      <MenuItems className="position-bottom-right">
        {collections.map(collection => (
          <MenuItem
            key={collection.id}
            item={itemProps => (
              <NavLink
                to={`/collections/${collection.handle}`}
                className={({ isActive }) =>
                  clsx(
                    { 'text-primary-700 font-bold': isActive },
                    itemProps.className
                  )
                }
              >
                {collection.title}
              </NavLink>
            )}
          />
        ))}
      </MenuItems>
    </Menu>
  );
};

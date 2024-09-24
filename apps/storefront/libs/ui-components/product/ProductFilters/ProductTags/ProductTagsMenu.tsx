import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import type { FC } from 'react';
import { FilterOptions } from '@marketplace/util/product-filters';
import { FilterState } from '../../../hooks/useProductPageFilters';
import { Button } from '@components/buttons/Button';
import { Menu } from '@components/menu/Menu';
import { MenuButton } from '@components/menu/MenuButton';
import { MenuItems } from '@components/menu/MenuItems';
import { ProductTagsList } from './ProductTagsList';

export interface ProductTagsMenuProps extends FilterState {
  tags?: FilterOptions['tags'];
}

export const ProductTagsMenu: FC<ProductTagsMenuProps> = props => {
  if (!props.tags?.length) return null;

  return (
    <Menu>
      <MenuButton>
        <Button size="sm">
          <span>Tags</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </MenuButton>
      <MenuItems className="position-bottom-right w-56">
        <ProductTagsList {...props} />
      </MenuItems>
    </Menu>
  );
};

import type { FC } from 'react';
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { Button } from '@components/buttons/Button';
import { MenuButton } from '@components/menu/MenuButton';
import { Menu } from '@components/menu/Menu';
import { MenuItems } from '@components/menu/MenuItems';
import { ProductCollectionsList } from './ProductCollectionsList';
import { FilterState } from '../../../hooks/useProductPageFilters';
import { FilterOptions } from '@libs/util/product-filters';

export interface ProductCollectionsMenuProps extends FilterState {
  collections?: FilterOptions['collections'];
}

export const ProductCollectionsMenu: FC<
  ProductCollectionsMenuProps
> = props => {
  if (!props.collections) return null;
  if (!props.collections?.length) return null;

  return (
    <Menu>
      <MenuButton>
        <Button size="sm">
          <span>Collections</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </MenuButton>
      <MenuItems className="position-bottom-right w-56">
        <ProductCollectionsList {...props} />
      </MenuItems>
    </Menu>
  );
};

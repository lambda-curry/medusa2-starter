import type { FC } from 'react';
import ChevronDownIcon from '@heroicons/react/24/solid/ChevronDownIcon';
import { Button } from '@components/buttons/Button';
import { MenuButton } from '@components/menu/MenuButton';
import { Menu } from '@components/menu/Menu';
import { MenuItems } from '@components/menu/MenuItems';
import { ProductCategoriesList } from './ProductCategoriesList';
import { FilterState } from '../../../hooks/useProductPageFilters';
import { FilterOptions } from '@libs/util/product-filters';

export interface ProductCategoriesMenuProps extends FilterState {
  categories: FilterOptions['categories'];
}

export const ProductCategoriesMenu: FC<ProductCategoriesMenuProps> = props => {
  if (!props.categories?.length) return null;

  return (
    <Menu>
      <MenuButton>
        <Button size="sm">
          <span>Categories</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </MenuButton>
      <MenuItems className="position-bottom-right w-56">
        <ProductCategoriesList {...props} />
      </MenuItems>
    </Menu>
  );
};

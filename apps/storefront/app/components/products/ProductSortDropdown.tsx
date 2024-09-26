import type { FC } from 'react';
import clsx from 'clsx';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  type MenuItemRenderProps,
} from '@components/menu';
import ArrowsUpDownIcon from '@heroicons/react/24/solid/ArrowsUpDownIcon';
import { useProductPageFilters } from '../../../libs/ui-components/hooks/useProductPageFilters';
import { type FilterOptions } from '@libs/util/product-filters';
import { Button } from '@components/buttons';

export const ProductSortDropdown: FC<{
  filterOptions: FilterOptions;
  allFilterOptions: FilterOptions;
}> = ({ filterOptions, allFilterOptions }) => {
  const { orderState } = useProductPageFilters({
    filterOptions,
    allFilterOptions,
  });

  const handleSortChange = (sortOption: string) => {
    orderState.setSelected(sortOption);
  };

  const orderDisplayMap = {
    popularity: 'Most Popular',
    product_rating: 'Highest Rated',
    '-created_at': 'Recently Added',
  };

  return (
    <Menu>
      <MenuButton>
        <div className="text-primary-700 hover:bg-primary-50 focus:bg-primary-50 flex cursor-pointer items-center rounded-md bg-slate-100 px-2 py-1">
          <ArrowsUpDownIcon className="mr-2 h-4 w-4" />
          {orderDisplayMap[orderState.selected as keyof typeof orderDisplayMap]}
        </div>
      </MenuButton>
      <MenuItems>
        {Object.entries(orderDisplayMap).map(([sortOption, displayText]) => (
          <MenuItem
            key={sortOption}
            item={(itemProps: MenuItemRenderProps) => (
              <Button
                variant="ghost"
                {...itemProps}
                className={clsx(
                  'hover:!bg-primary-50 focus:!bg-primary-50 cursor-pointer !justify-start text-start',
                  {
                    'text-primary-700 font-bold':
                      orderState.selected === sortOption,
                  },
                  itemProps.className
                )}
                onClick={() => handleSortChange(sortOption)}
              >
                {displayText}
              </Button>
            )}
          >
            {displayText}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};

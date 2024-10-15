import { Tab } from '@headlessui/react';
import { StoreProductCategory } from '@medusajs/types';
import { Fragment, type FC } from 'react';
import { TabButton } from '@app/components/tabs/TabButton';
import { TabList } from '@app/components/tabs/TabList';

export interface ProductCategoryTabsProps {
  categories: StoreProductCategory[];
  selectedIndex?: number;
  onChange?: (index: number) => void;
}

export const ProductCategoryTabs: FC<ProductCategoryTabsProps> = ({ categories, ...props }) => {
  if (!categories?.length) return null;

  return (
    <Tab.Group {...props}>
      <TabList>
        <Tab as={Fragment}>{({ selected }) => <TabButton selected={selected}>All</TabButton>}</Tab>

        {categories.map((category) => (
          <Tab key={category.id} as={Fragment}>
            {({ selected }) => <TabButton selected={selected}>{category.name}</TabButton>}
          </Tab>
        ))}
      </TabList>
    </Tab.Group>
  );
};

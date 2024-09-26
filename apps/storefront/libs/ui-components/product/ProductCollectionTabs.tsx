import { Tab } from '@headlessui/react';
import { ProductCollection } from '@libs/util/medusa';
import { Fragment, type FC } from 'react';
import { TabButton } from '~/components/tabs/TabButton';
import { TabList } from '~/components/tabs/TabList';

export interface ProductCollectionTabsProps {
  collections: ProductCollection[];
  selectedIndex?: number;
  onChange?: (index: number) => void;
}

export const ProductCollectionTabs: FC<ProductCollectionTabsProps> = ({ collections, ...props }) => {
  if (!collections?.length) return null;

  return (
    <Tab.Group {...props}>
      <TabList>
        <Tab as={Fragment}>{({ selected }) => <TabButton selected={selected}>All</TabButton>}</Tab>

        {collections.map(collection => (
          <Tab key={collection.id} as={Fragment}>
            {({ selected }) => <TabButton selected={selected}>{collection.title}</TabButton>}
          </Tab>
        ))}
      </TabList>
    </Tab.Group>
  );
};

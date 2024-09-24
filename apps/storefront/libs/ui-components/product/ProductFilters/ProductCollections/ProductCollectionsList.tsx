import { Listbox, ListboxOptions } from '@headlessui/react';
import { FilterState } from '../../../hooks/useProductPageFilters';
import { CollectionOption } from './CollectionOption';
import { ProductCollection } from '@marketplace/util/medusa';

export interface ProductCollectionsListProps extends FilterState {
  collections?: (ProductCollection & { product_count: number })[];
}

export const ProductCollectionsList: React.FC<ProductCollectionsListProps> = ({
  collections,
  selected,
  setSelected
}) => {
  return (
    <Listbox key={JSON.stringify(selected)} defaultValue={selected} onChange={setSelected} multiple>
      <ListboxOptions className="w-full overflow-auto text-base sm:text-sm" static>
        {collections?.map(collection => (
          <CollectionOption key={collection.id} collection={collection} />
        ))}
      </ListboxOptions>
    </Listbox>
  );
};

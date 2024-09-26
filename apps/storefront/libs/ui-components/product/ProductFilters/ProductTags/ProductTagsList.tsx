import { Listbox, ListboxOptions } from '@headlessui/react';
import { TagOption } from './TagOption';
import { FilterState } from '../../../hooks/useProductPageFilters';
import { ProductTag } from '@libs/util/medusa';

export interface ProductTagsListProps extends FilterState {
  tags?: (ProductTag & { product_count: number })[];
}

export const ProductTagsList: React.FC<ProductTagsListProps> = ({ tags, selected, setSelected, clearSelected }) => {
  return (
    <div className="pt-2">
      <Listbox key={JSON.stringify(selected)} defaultValue={selected} onChange={setSelected} multiple>
        <ListboxOptions className="flex w-full flex-wrap gap-2 gap-y-2.5 overflow-auto text-base sm:text-sm" static>
          {tags?.map(tag => (
            <TagOption key={tag.id} tag={tag} />
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

import { Listbox, ListboxOptions } from '@headlessui/react';
import { CategoryOption, ProductCategoryWithSubCategories } from './CategoryOption';
import { FilterState } from '../../../hooks/useProductPageFilters';

export interface ProductCategoriesListProps extends FilterState {
  categories?: ProductCategoryWithSubCategories[];
}

export const ProductCategoriesList: React.FC<ProductCategoriesListProps> = ({ categories, selected, setSelected }) => {
  return (
    <Listbox key={JSON.stringify(selected)} defaultValue={selected} onChange={setSelected} multiple>
      <ListboxOptions className="w-full overflow-auto text-base sm:text-sm" static>
        {categories?.map(category => (
          <CategoryOption key={category.id} category={category} level={0} />
        ))}
      </ListboxOptions>
    </Listbox>
  );
};

// import { FC } from 'react';
// import { ProductCollectionsMenu } from './ProductCollectionsMenu';
// import { ProductCategoriesMenu } from './ProductFilters/ProductCategories/ProductCategoriesMenu';
// import { ProductTagsMenu } from './ProductTagsMenu';
// import { useProductPageFilters } from '../hooks/useProductPageFilters';

// // interface ProductGridFiltersProps {}

// export const MobileProductGridFilters: FC<{}> = () => {
//   const {
//     filters,
//     filterQuery,
//     categoryFilterState: { selected: selectedCategories, setSelected: setSelectedCategories }
//   } = useProductPageFilters();

//   const categories = filters?.categories;

//   if (!categories || categories.length === 0) return null;

//   return (
//     <div className="flex items-center justify-end gap-4 sm:hidden">
//       <ProductCategoriesMenu
//         categories={filters.categories}
//         selectedCategories={selectedCategories}
//         onSelectedCategoriesChange={setSelectedCategories}
//       />
//       <ProductCollectionsMenu collections={filters.collections} />
//       <ProductTagsMenu tags={filters.tags} />
//     </div>
//   );
// };

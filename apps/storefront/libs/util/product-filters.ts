import { ProductCategory, ProductCollection, ProductTag, ProductType } from './medusa/types';

export type CategoryWithSubCategories = ProductCategory & {
  product_count: number;
  sub_categories?: CategoryWithSubCategories[];
};

export interface FilterOptions {
  collections?:
    | (ProductCollection & {
        product_count: number;
      })[]
    | undefined;
  tags?:
    | (ProductTag & {
        product_count: number;
      })[]
    | undefined;
  types?:
    | (ProductType & {
        product_count: number;
      })[]
    | undefined;
  categories?:
    | (ProductCategory & {
        product_count: number;
      })[]
    | undefined;
  order?: string;
}

export function nestCategories(
  categories: (ProductCategory & {
    product_count: number;
  })[]
): CategoryWithSubCategories[] {
  const idCategoryMap = categories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as Record<string, CategoryWithSubCategories>);

  categories.forEach(category => {
    if (category.parent_category_id) {
      const parent = idCategoryMap[category.parent_category_id];
      if (!parent.sub_categories) parent.sub_categories = [category];
      else parent.sub_categories.push(category);
    }
  });

  return categories
    .filter(category => !category.parent_category_id)
    .sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999))
    .map(category => {
      const toChange = category as CategoryWithSubCategories;
      toChange.sub_categories = toChange.sub_categories?.sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
      return toChange;
    });
}

export const mergeFilterOptionsWithProductCounts = (
  allOptions: FilterOptions,
  currentOptions: FilterOptions
): FilterOptions => {
  return allOptions;
  // Note: this is tricky, I'm not even sure we want to do this
  // const mergedOptions: FilterOptions = { ...allOptions };

  // (Object.keys(allOptions) as Array<keyof FilterOptions>).forEach(key => {
  //   if (Array.isArray(allOptions[key])) {
  //     mergedOptions[key] = allOptions[key].map(option => {
  //       if (key === 'collections') return option;
  //       const matchedOption = currentOptions[key]?.find(currentOption => currentOption.id === option.id);
  //       return {
  //         ...option,
  //         product_count: matchedOption ? matchedOption.product_count : 0
  //       };
  //     }) as any;
  //   }
  // });
  // return mergedOptions;
};

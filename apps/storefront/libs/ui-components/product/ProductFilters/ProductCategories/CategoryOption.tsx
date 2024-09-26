import type { FC } from 'react';
import { ListboxOption } from '@headlessui/react';
import clsx from 'clsx';
import { CheckCircleIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';
import { ProductCategory } from '@libs/util/medusa';

export type ProductCategoryWithSubCategories = ProductCategory & { product_count: number } & {
  sub_categories?: ProductCategoryWithSubCategories[];
};

export const CategoryOption: FC<{
  level: number;
  category: ProductCategoryWithSubCategories;
}> = ({ category, level }) => (
  <>
    <ListboxOption
      as="li"
      className="group relative cursor-pointer select-none list-none text-sm"
      key={category.id}
      value={category.handle}
    >
      {({ selected }) => (
        <div
          className={clsx('hover:bg-primary-50 hover:text-primary-700 flex justify-between rounded-md py-2 pr-4', {
            'pl-9 font-bold ': level === 0,
            'pl-14': level === 1,
            'pl-16': level === 2,
            'pl-[70px]': level === 3
          })}
        >
          <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>{category.name}</span>
          <span className="ml-2 text-xs text-gray-500">{category.product_count}</span>
          {selected ? (
            <span className="text-primary-600 absolute inset-y-0 left-0 flex items-center pl-1">
              <SolidCheckCircleIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          ) : (
            <span className="group-hover:text-primary-600 absolute inset-y-0 left-0 flex items-center pl-1 text-gray-200">
              <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          {level > 0 && (
            <span
              className={clsx('absolute inset-y-0 left-0 flex items-center text-gray-400', {
                'pl-9': level === 1,
                'pl-11': level === 2,
                'pl-[52px]': level === 3
              })}
            >
              <ChevronDoubleRightIcon className="h-3 w-3" />
            </span>
          )}
        </div>
      )}
    </ListboxOption>
    {category.sub_categories?.map(subCategory => (
      <CategoryOption key={subCategory.id} category={subCategory} level={level + 1} />
    ))}
  </>
);

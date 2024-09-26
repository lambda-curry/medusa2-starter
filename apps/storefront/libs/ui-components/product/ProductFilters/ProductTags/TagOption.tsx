import { ListboxOption } from '@headlessui/react';
import { ProductTag } from '@libs/util/medusa';

import clsx from 'clsx';
import type { FC } from 'react';

export const TagOption: FC<{
  tag: ProductTag & { product_count: number };
}> = ({ tag }) => {
  return (
    <ListboxOption as="li" className="max-w-[13rem] list-none" key={tag.id} value={tag.value}>
      {({ selected }) => {
        const tagClassNames = clsx(
          'inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium cursor-pointer ring-[0.5px] ring-inset max-w-full',
          {
            'bg-primary-200 text-primary-700 ring-primary-500/20': selected,
            'bg-gray-50 text-gray-700 ring-gray-500/20': !selected
          }
        );

        return (
          <div className={tagClassNames}>
            <span className="truncate">{tag.value}</span>
            <span className="ml-2 text-xs text-gray-500">{tag.product_count}</span>
          </div>
        );
      }}
    </ListboxOption>
  );
};

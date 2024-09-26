import type { FC } from 'react';
import { ListboxOption } from '@headlessui/react';
import type { ProductCollection } from '@libs/util/medusa';
import clsx from 'clsx';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as SolidCheckCircleIcon } from '@heroicons/react/24/solid';

export const CollectionOption: FC<{
  collection: ProductCollection & { product_count: number };
}> = ({ collection }) => (
  <ListboxOption
    as="li"
    className="group relative cursor-pointer select-none list-none text-sm"
    key={collection.id}
    value={collection.handle}
  >
    {({ selected }) => (
      <div
        className={clsx('hover:bg-primary-50 hover:text-primary-700 flex justify-between rounded-md py-2 pl-9 pr-4', {
          'font-bold': selected,
          'font-normal': !selected
        })}
      >
        <span className={`block truncate ${selected ? 'font-bold' : 'font-normal'}`}>{collection.title}</span>
        <span className="ml-2 text-xs text-gray-500">{collection.product_count}</span>
        {selected ? (
          <span className="text-primary-600 absolute inset-y-0 left-0 flex items-center pl-1">
            <SolidCheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : (
          <span className="group-hover:text-primary-600 absolute inset-y-0 left-0 flex items-center pl-1 text-gray-200">
            <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
    )}
  </ListboxOption>
);

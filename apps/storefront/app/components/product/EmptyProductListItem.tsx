import { HTMLAttributes } from 'react';
import clsx from 'clsx';

export interface EmptyProductListItemProps extends HTMLAttributes<HTMLElement> {}

export const EmptyProductListItem: React.FC<EmptyProductListItemProps> = ({ className, ...props }) => (
  <article className={clsx(className, 'group')} {...props}>
    <figure className="aspect-w-1 aspect-h-1 h-full w-full overflow-hidden rounded-lg border">
      <div className="h-full w-full bg-gray-200 object-cover object-center group-hover:opacity-75" />
    </figure>
  </article>
);

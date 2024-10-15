import { FC } from 'react';
import { Pagination, PaginationConfig } from './Pagination';
import { isBrowser } from '@libs/util/is-browser';

function getPaginationLink({
  context,
  page,
  section,
  difference = 0,
  prefix = '',
}: {
  prefix?: string;
  context: string;
  page: number;
  section?: string;
  difference?: number;
}) {
  const windowSearch = isBrowser ? window.location.search : '';
  const contextSplit = isBrowser ? context.split('?')[1] || '' + windowSearch : context.split('?')[1];
  const contextSearchParams = new URLSearchParams(contextSplit);
  const newPage = page + difference;

  if (newPage > 0) contextSearchParams.set(`${prefix}page`, newPage.toString());
  return `/${context.split('?')[0].replace('?', '')}?${contextSearchParams.toString()}${section ? `#${section}` : ''}`;
}

export const PaginationWithContext: FC<{
  context: string;
  section?: string;
  paginationConfig: PaginationConfig;
}> = ({ context, section, ...props }) => {
  if (!props.paginationConfig) return null;
  const prefix = props.paginationConfig.prefix;

  return (
    <Pagination
      {...props}
      getPreviousProps={({ currentPage }) => ({
        href: getPaginationLink({
          context,
          prefix,
          page: currentPage,
          difference: -1,
          section,
        }),
      })}
      getPaginationItemProps={({ page }) => ({
        href: getPaginationLink({ context, prefix, page, section }),
      })}
      getNextProps={({ currentPage }) => ({
        href: getPaginationLink({
          context,
          prefix,
          page: currentPage,
          difference: 1,
          section,
        }),
      })}
    />
  );
};

import { ReactNode } from 'react';

import { usePagination } from './usePagination';

type PaginationProps = {
  children: (arg0: ReturnType<typeof usePagination>) => ReactNode;
  totalItems?: number;
  initialPage?: number;
  initialPageSize: number;
};

function Pagination({ children, totalItems = 0, initialPage = 0, initialPageSize }: PaginationProps) {
  return children(usePagination({ totalItems, initialPage, initialPageSize }));
}

Pagination.displayName = 'Pagination';

export { Pagination };

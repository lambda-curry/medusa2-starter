import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon';
import { FC, ReactNode, useEffect } from 'react';
import { usePagination } from './react-use-pagination';
import clsx from 'clsx';
import { Link } from '@remix-run/react';

export interface PaginationConfig {
  prefix?: string;
  count: number;
  offset: number;
  limit: number;
}

interface PaginationButtonProps {
  href: string;
}
export interface PaginationProps {
  getNextProps: ({ currentPage }: { currentPage: number }) => PaginationButtonProps;
  getPaginationItemProps: ({ page }: { page: number }) => PaginationButtonProps;
  getPreviousProps: ({ currentPage }: { currentPage: number }) => PaginationButtonProps;
  paginationConfig: PaginationConfig;
}

export type RenderPaginationItem = FC<{ page: number; className?: string } & React.HTMLProps<HTMLAnchorElement>>;

export type RenderPreviousPaginationButton = FC<
  {
    currentPage: number;
    isDisabled: boolean;
    className?: string;
  } & React.HTMLProps<HTMLAnchorElement>
>;

export type RenderNextPaginationButton = FC<
  {
    page: number;
    isDisabled: boolean;
    className?: string;
  } & React.HTMLProps<HTMLAnchorElement>
>;

export interface PaginationItemProps extends PaginationButtonProps {
  className?: string;
  currentPage: number;
  page: number;
}

const PaginationItem: FC<PaginationItemProps> = ({ className, currentPage, page, ...props }) => {
  const currentClasses = 'z-10 bg-primary-50 border-primary-500 text-primary-600';
  const defaultClasses = 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50';
  const isCurrent = page === currentPage;

  return (
    <Link
      viewTransition
      className={clsx(
        className,
        'relative inline-flex items-center border px-4 py-2 text-sm font-bold',
        isCurrent ? currentClasses : defaultClasses,
      )}
      aria-current={isCurrent ? 'page' : 'false'}
      to={props.href}
      prefetch="intent"
    >
      {page}
    </Link>
  );
};

export interface PaginationArrowButtonProps extends PaginationButtonProps {
  currentPage: number;
  className?: string;
  isDisabled: boolean;
  children: ReactNode;
}

const PaginationButton: FC<PaginationArrowButtonProps> = ({
  currentPage: _currentPage,
  className: _className,
  isDisabled,
  href,
  children,
}) => {
  const className = clsx(
    _className,
    { 'pointer-events-none cursor-not-allowed opacity-50': isDisabled },
    'relative inline-flex items-center border border-gray-300 bg-white px-2 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 sm:px-4',
  );

  if (isDisabled)
    return (
      <button aria-disabled={isDisabled} disabled className={className}>
        {children}
      </button>
    );

  return (
    <Link
      viewTransition
      aria-disabled={isDisabled}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isDisabled) event.preventDefault();
      }}
      className={className}
      to={href}
      prefetch="intent"
    >
      {children}
    </Link>
  );
};

export const Pagination: FC<PaginationProps> = ({
  paginationConfig,
  getNextProps,
  getPaginationItemProps,
  getPreviousProps,
}) => {
  const { totalPages, startIndex, endIndex, setPage } = usePagination({
    totalItems: paginationConfig.count,
    initialPageSize: paginationConfig.limit,
  });

  const currentPage = Math.floor(paginationConfig.offset / paginationConfig.limit) + 1;

  useEffect(() => {
    setPage(currentPage - 1);
  }, [currentPage, setPage]);

  if (paginationConfig.count <= paginationConfig.limit) return null;

  const startPage = totalPages <= 5 ? 1 : Math.max(1, currentPage - 1);
  const endPage = totalPages <= 5 ? totalPages : Math.min(totalPages, currentPage + 1);

  return (
    <div className="mt-16 flex items-center justify-between border-t border-gray-200 py-3">
      <div className="flex flex-1 flex-col-reverse flex-wrap items-center justify-between gap-4 sm:flex-row">
        <div>
          <p className="mb-4 text-sm text-gray-700 sm:mb-0">
            Showing <span className="font-bold">{startIndex + 1}</span> to{' '}
            <span className="font-bold">{endIndex + 1}</span> of{' '}
            <span className="font-bold">{paginationConfig.count}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <PaginationButton
              className="rounded-l-md"
              currentPage={currentPage}
              isDisabled={currentPage === 1}
              {...getPreviousProps({ currentPage })}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </PaginationButton>

            {startPage > 2 && (
              <>
                <PaginationItem page={1} currentPage={currentPage} {...getPaginationItemProps({ page: 1 })} />
                <span className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 sm:px-4">
                  ...
                </span>
              </>
            )}

            {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
              <PaginationItem key={page} page={page} currentPage={currentPage} {...getPaginationItemProps({ page })} />
            ))}

            {endPage < totalPages - 1 && (
              <>
                <span className="relative inline-flex items-center border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-gray-700 sm:px-4">
                  ...
                </span>
                <PaginationItem
                  page={totalPages}
                  currentPage={currentPage}
                  {...getPaginationItemProps({ page: totalPages })}
                />
              </>
            )}

            <PaginationButton
              className="rounded-r-md"
              currentPage={currentPage}
              isDisabled={currentPage === totalPages}
              {...getNextProps({ currentPage })}
            >
              <span className="sr-only">Next</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </PaginationButton>
          </nav>
        </div>
      </div>
    </div>
  );
};

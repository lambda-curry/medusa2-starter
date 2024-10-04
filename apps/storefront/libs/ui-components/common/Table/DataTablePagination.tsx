import ChevronDoubleLeftIcon from '@heroicons/react/24/solid/ChevronDoubleLeftIcon';
import ChevronDoubleRightIcon from '@heroicons/react/24/solid/ChevronDoubleRightIcon';
import ChevronLeftIcon from '@heroicons/react/24/solid/ChevronLeftIcon';
import ChevronRightIcon from '@heroicons/react/24/solid/ChevronRightIcon';
import { Table } from '@tanstack/react-table';
import clsx from 'clsx';
import { IconButton } from '../buttons';
import { Select } from '../forms/inputs/Select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  totalRecords: number;
  className?: string;
}

export function DataTablePagination<TData>({ table, totalRecords, className }: DataTablePaginationProps<TData>) {
  const pageCount = Math.ceil(totalRecords / table.getState().pagination.pageSize);
  const canGoToNextPage =
    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize < totalRecords;

  const canGoToPreviousPage = table.getState().pagination.pageIndex > 0;

  if (totalRecords === 0) return null;
  return (
    <div
      className={clsx(
        'flex flex-wrap items-center justify-between gap-2 rounded-md border bg-white px-4 py-2',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
        <Select
          className="-ml-2 w-[150px] text-xs"
          name="pageSize"
          value={table.getState().pagination.pageSize.toString()}
          options={[
            { label: '5 rows/page', value: '5' },
            { label: '10 rows/page', value: '10' },
            { label: '20 rows/page', value: '20' },
            { label: '50 rows/page', value: '50' },
            { label: '100 rows/page', value: '100' }
          ]}
          onChange={e => {
            table.setPageSize(Number(e.target.value));
          }}
        />

        <div className="text-muted-foreground min-w-[100px] flex-1 text-sm">{totalRecords} total</div>
      </div>
      <div className="flex flex-1 items-end justify-between space-x-6 sm:items-center sm:justify-end lg:space-x-8">
        <div className="align-start flex flex-wrap justify-end gap-x-4 gap-y-1">
          <div className="flex items-center justify-end text-xs font-medium sm:justify-start">
            Page {table.getState().pagination.pageIndex + 1} of {pageCount}
          </div>
          <div className="flex items-center justify-end gap-2">
            <IconButton
              type="button"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!canGoToPreviousPage}
              icon={ChevronDoubleLeftIcon}
            />
            <IconButton
              type="button"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!canGoToPreviousPage}
              icon={ChevronLeftIcon}
            />
            <IconButton
              type="button"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!canGoToNextPage}
              icon={ChevronRightIcon}
            />
            <IconButton
              type="button"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!canGoToNextPage}
              icon={ChevronDoubleRightIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

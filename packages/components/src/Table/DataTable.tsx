'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  TableState,
  PaginationState,
  OnChangeFn
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';
import { DataTablePagination } from './DataTablePagination';
import React from 'react';
import clsx from 'clsx';

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  onPaginationChange?: OnChangeFn<PaginationState>;
  onSortingChange?: OnChangeFn<SortingState>;
  state?: Partial<TableState>;
  totalRecords?: number;
  manualPagination?: boolean;
  manualSorting?: boolean;
  pagination?: boolean;
  showHeader?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  state,
  onPaginationChange,
  onSortingChange,
  totalRecords = 0,
  manualPagination = true,
  manualSorting = true,
  pagination = true,
  showHeader = true
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: onSortingChange,
    getSortedRowModel: getSortedRowModel(),
    state,
    onPaginationChange: onPaginationChange,
    manualPagination,
    manualSorting
  });

  const shouldShowPagination = pagination;

  return (
    <>
      <div className={clsx(className, 'rounded-md border')}>
        <Table>
          {!!showHeader && (
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
          )}
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={(row.original as any)?.className ?? ''}
                >
                  {row.getVisibleCells().map(cell => {
                    const value = cell.getValue();
                    const isElement = typeof value === 'object' && value !== null && React.isValidElement(value);

                    return (
                      <TableCell key={cell.id}>
                        {isElement
                          ? value
                          : flexRender(
                              cell.column.columnDef.cell,

                              cell.getContext()
                            )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {shouldShowPagination && <DataTablePagination className="mt-2" table={table} totalRecords={totalRecords ?? 0} />}
    </>
  );
}

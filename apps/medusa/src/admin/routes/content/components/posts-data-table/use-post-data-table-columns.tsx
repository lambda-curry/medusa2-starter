import React from 'react';
import { createDataTableColumnHelper, Text, StatusBadge, usePrompt } from '@medusajs/ui';
import { PencilSquare, SquareTwoStackMini, Trash } from '@medusajs/icons';
import type { Post } from '@lambdacurry/page-builder-types';

export type ColumnActions = {
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const columnHelper = createDataTableColumnHelper<Post>();

/**
 * Hook that returns column definitions for the PostsDataTable
 */
export const usePostsDataTableColumns = (actions: ColumnActions = {}) => {
  const { onEdit, onDuplicate, onDelete } = actions;
  const prompt = usePrompt();

  return React.useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        enableSorting: true,
        sortLabel: 'Title',
      }),
      columnHelper.accessor('handle', {
        header: 'Handle',
        enableSorting: true,
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <StatusBadge color={status === 'published' ? 'green' : 'grey'} className="bg-transparent">
              {status === 'published' ? 'Published' : 'Draft'}
            </StatusBadge>
          );
        },
        enableSorting: true,
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        enableSorting: true,
      }),
      columnHelper.accessor('created_at', {
        header: 'Date Created',
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return <Text>{date.toLocaleDateString()}</Text>;
        },
        enableSorting: true,
      }),
      columnHelper.accessor('updated_at', {
        header: 'Last Updated',
        cell: ({ getValue }) => {
          const dateValue = getValue();
          if (!dateValue) return <Text>–</Text>;

          const date = new Date(dateValue);
          return <Text>{date.toLocaleDateString()}</Text>;
        },
        enableSorting: true,
      }),
      columnHelper.action({
        // @ts-ignore
        actions: ({ row }) => [
          [
            {
              icon: <PencilSquare />,
              label: 'Edit',
              onClick: () => {
                if (onEdit) {
                  onEdit(row.original.id);
                } else {
                  console.log('edit', row.original.id);
                }
              },
            },
          ],
          [
            {
              icon: <SquareTwoStackMini />,
              label: 'Duplicate',
              onClick: () => {
                onDuplicate?.(row.original.id);
              },
            },
          ],
          [
            {
              icon: <Trash />,
              label: 'Delete',
              onClick: async () => {
                const res = await prompt({
                  title: 'Are you sure?',
                  description: `You are about to delete the page "${row.original.title}". This action cannot be undone.`,
                  confirmText: 'Delete',
                  cancelText: 'Cancel',
                });

                if (!res) return;

                onDelete?.(row.original.id);
              },
            },
          ],
        ],
      }),
    ],
    [onEdit, onDuplicate, onDelete, prompt],
  );
};

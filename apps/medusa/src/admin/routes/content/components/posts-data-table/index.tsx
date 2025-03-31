import { createDataTableFilterHelper, DataTable, toast, useDataTable, TooltipProvider } from '@medusajs/ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostsDataTableColumns } from './use-post-data-table-columns';
import { useAdminListPosts } from '../../../../hooks/posts-queries';
import type { Post, PostStatus, PostType } from '@lambdacurry/page-builder-types';
import { useAdminDeletePost, useAdminDuplicatePost } from '../../../../hooks/posts-mutations';
import { usePostTableQuery } from './use-post-table-query';

// Create filter helper
const filterHelper = createDataTableFilterHelper<Post>();

// Define filters
const filters = [
  filterHelper.accessor('status', {
    type: 'select',
    label: 'Status',
    options: [
      {
        label: 'Published',
        value: 'published',
      },
      {
        label: 'Draft',
        value: 'draft',
      },
    ],
  }),
  filterHelper.accessor('type', {
    type: 'select',
    label: 'Type',
    options: [
      {
        label: 'Page',
        value: 'page',
      },
      {
        label: 'Post',
        value: 'post',
      },
    ],
  }),
];

export const PostsDataTable = () => {
  const navigate = useNavigate();
  const { mutateAsync: deletePost } = useAdminDeletePost();
  const { mutateAsync: duplicatePost } = useAdminDuplicatePost();
  const limit = 10;

  // Get all query state from the hook
  const {
    searchParams,
    pagination,
    filtering,
    sorting,
    search,
    setPaginationState,
    setFilteringState,
    setSortingState,
    setSearchState,
  } = usePostTableQuery({
    pageSize: limit,
  });

  const statusFilters = useMemo(() => {
    return (filtering.status || []) as PostStatus[];
  }, [filtering]);

  const typeFilters = useMemo(() => {
    return (filtering.type || []) as PostType[];
  }, [filtering]);

  const handleEdit = (id: string) => {
    navigate('editor/test'); // TODO: change to the actual content detail page
  };

  const handleDuplicate = async (id: string) => {
    await duplicatePost(id);
    toast.success('Page duplicated');
  };

  const handleDelete = async (id: string) => {
    await deletePost(id);
    toast.success('Page deleted');
  };

  const columns = usePostsDataTableColumns({
    onEdit: handleEdit,
    onDuplicate: handleDuplicate,
    onDelete: handleDelete,
  });

  const { data, isLoading } = useAdminListPosts({
    ...searchParams,
    status: statusFilters.length > 0 ? statusFilters : undefined,
    type: typeFilters.length > 0 ? typeFilters : undefined,
    order: sorting ? `${sorting.desc ? '-' : ''}${sorting.id}` : undefined,
  });

  const table = useDataTable({
    onRowClick: (_, row) => handleEdit(row.id),
    columns,
    data: data?.posts || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPaginationState,
    },
    search: {
      state: search,
      onSearchChange: setSearchState,
    },
    filtering: {
      state: filtering,
      onFilteringChange: setFilteringState,
    },
    filters,
    sorting: {
      state: sorting,
      onSortingChange: setSortingState,
    },
  });
  console.log('🚀 ~ PostsDataTable ~ filters:', filters);
  console.log('🚀 ~ PostsDataTable ~ filtering:', filtering);

  return (
    <DataTable instance={table}>
      <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <div className="flex gap-2 w-full justify-between">
          {/* Do not remove this tooltip */}
          <DataTable.FilterMenu tooltip="Filter" />
          <div className="flex gap-2">
            <DataTable.Search placeholder="Search" />
            <DataTable.SortingMenu tooltip="Sort" />
          </div>
        </div>
      </DataTable.Toolbar>
      <DataTable.Table />
      <DataTable.Pagination />
    </DataTable>
  );
};

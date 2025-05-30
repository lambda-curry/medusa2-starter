import { useMemo } from 'react';
import type { DataTableFilteringState, DataTablePaginationState, DataTableSortingState } from '@medusajs/ui';
import type {
  PostContentMode,
  PostType,
  PostStatus,
  AdminPageBuilderListPostsQuery,
} from '@lambdacurry/page-builder-types';

import { useQueryParams } from '../../../../hooks/use-query-params';

type UsePostTableQueryProps = {
  prefix?: string;
  pageSize?: number;
};

const DEFAULT_FIELDS = [
  'id',
  'type',
  'title',
  'handle',
  'excerpt',
  'status',
  'published_at',
  'archived_at',
  'is_home_page',
  'created_at',
  'updated_at',
  'featured_image.*',
].join(',');

export const usePostTableQuery = ({ prefix, pageSize = 10 }: UsePostTableQueryProps) => {
  const { queryObject, setQueryObject } = useQueryParams(
    [
      'offset',
      'order',
      'q',
      'title',
      'handle',
      'status',
      'type',
      'content_mode',
      'is_home_page',
      'published_at',
      'archived_at',
      'created_at',
      'updated_at',
      'id',
    ],
    prefix,
  );

  const {
    offset,
    title,
    handle,
    status,
    type,
    content_mode,
    is_home_page,
    published_at,
    archived_at,
    created_at,
    updated_at,
    order,
    q,
  } = queryObject;

  // Derived state for data table
  const pagination = useMemo<DataTablePaginationState>(
    () => ({
      pageSize,
      pageIndex: offset ? Math.floor(Number(offset) / pageSize) : 0,
    }),
    [offset, pageSize],
  );

  const filtering = useMemo<DataTableFilteringState>(() => {
    const filterState: DataTableFilteringState = {};

    if (status) {
      filterState.status = Array.isArray(status) ? status : status.split(',');
    }

    if (type) {
      filterState.type = Array.isArray(type) ? type : type.split(',');
    }

    return filterState;
  }, [status, type]);

  const sorting = useMemo<DataTableSortingState | null>(() => {
    if (order) {
      const isDesc = order.startsWith('-');
      const field = isDesc ? order.substring(1) : order;
      return {
        id: field,
        desc: isDesc,
      };
    }
    return null;
  }, [order]);

  const searchParams: AdminPageBuilderListPostsQuery = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    title: title,
    handle: handle,
    status: status?.split(',') as PostStatus[],
    type: type?.split(',') as PostType[],
    content_mode: content_mode?.split(',') as PostContentMode[],
    is_home_page: is_home_page ? is_home_page === 'true' : undefined,
    published_at: published_at ? JSON.parse(published_at) : undefined,
    archived_at: archived_at ? JSON.parse(archived_at) : undefined,
    created_at: created_at ? JSON.parse(created_at) : undefined,
    updated_at: updated_at ? JSON.parse(updated_at) : undefined,
    order: order,
    q,
    fields: DEFAULT_FIELDS,
  };

  // State updaters
  const setSearchParams = (params: Partial<AdminPageBuilderListPostsQuery>) => {
    const newQueryObject: Record<string, string | undefined> = {};

    if ('q' in params) {
      newQueryObject.q = params.q || undefined;
    }

    if ('status' in params) {
      if (params.status && Array.isArray(params.status) && params.status.length > 0) {
        newQueryObject.status = params.status.join(',');
      } else if (typeof params.status === 'string') {
        newQueryObject.status = params.status;
      } else {
        newQueryObject.status = undefined;
      }
    }

    if ('type' in params) {
      if (params.type && Array.isArray(params.type) && params.type.length > 0) {
        newQueryObject.type = params.type.join(',');
      } else if (typeof params.type === 'string') {
        newQueryObject.type = params.type;
      } else {
        newQueryObject.type = undefined;
      }
    }

    if ('content_mode' in params) {
      if (params.content_mode && Array.isArray(params.content_mode) && params.content_mode.length > 0) {
        newQueryObject.content_mode = params.content_mode.join(',');
      } else if (typeof params.content_mode === 'string') {
        newQueryObject.content_mode = params.content_mode;
      } else {
        newQueryObject.content_mode = undefined;
      }
    }

    if (params.is_home_page !== undefined) {
      newQueryObject.is_home_page = params.is_home_page?.toString();
    }

    if (params.order !== undefined) {
      newQueryObject.order = params.order || undefined;
    }

    if (params.offset !== undefined) {
      newQueryObject.offset = params.offset?.toString();
    }

    setQueryObject(newQueryObject);
  };

  // Simplified handlers for common operations
  const setPaginationState = (newPagination: DataTablePaginationState) => {
    setSearchParams({ offset: newPagination.pageIndex * pageSize });
  };

  const setFilteringState = (newFiltering: DataTableFilteringState) => {
    console.log('🚀 ~ setFilteringState ~ newFiltering:', newFiltering);
    setSearchParams({
      status: (newFiltering.status || []) as PostStatus[],
      type: (newFiltering.type || []) as PostType[],
    });
  };

  const setSortingState = (newSorting: DataTableSortingState | null) => {
    if (newSorting) {
      setSearchParams({
        order: `${newSorting.desc ? '-' : ''}${newSorting.id}`,
      });
    } else {
      setSearchParams({ order: undefined });
    }
  };

  const setSearchState = (search: string) => {
    setSearchParams({ q: search || undefined });
  };

  return {
    searchParams,
    raw: queryObject,
    setSearchParams,
    // Derived state
    pagination,
    filtering,
    sorting,
    search: q || '',
    // State updaters
    setPaginationState,
    setFilteringState,
    setSortingState,
    setSearchState,
  };
};

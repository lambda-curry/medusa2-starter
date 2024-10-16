import { useCallback, useEffect, useMemo, useRef, useReducer } from 'react';
import { getPaginationMeta, PaginationState, PaginationMeta } from './getPaginationMeta';
import { paginationStateReducer } from './paginationStateReducer';

type UsePaginationConfig = {
  totalItems?: number;
  initialPage?: number;
  initialPageSize?: number;
};

type PaginationActions = {
  setPage: (page: number) => void;
  setNextPage: () => void;
  setPreviousPage: () => void;
  setPageSize: (pageSize: number, nextPage?: number) => void;
};

export function usePagination({
  totalItems = 0,
  initialPage = 0,
  initialPageSize = 0,
}: UsePaginationConfig = {}): PaginationState & PaginationMeta & PaginationActions {
  const initialState = {
    totalItems,
    pageSize: initialPageSize,
    currentPage: initialPage,
  };

  const [paginationState, dispatch] = useReducer(paginationStateReducer, initialState);

  const totalItemsRef = useRef(totalItems);
  totalItemsRef.current = totalItems;

  useEffect(() => {
    return () => {
      if (typeof totalItemsRef.current !== 'number' || totalItems === totalItemsRef.current) {
        return;
      }

      dispatch({ type: 'SET_TOTALITEMS', totalItems: totalItemsRef.current });
    };
  }, [totalItems]);

  return {
    ...paginationState,
    ...useMemo(() => getPaginationMeta(paginationState), [paginationState]),
    setPage: useCallback((page: number) => {
      dispatch({
        type: 'SET_PAGE',
        page,
      });
    }, []),
    setNextPage: useCallback(() => {
      dispatch({ type: 'NEXT_PAGE' });
    }, []),
    setPreviousPage: useCallback(() => {
      dispatch({ type: 'PREVIOUS_PAGE' });
    }, []),
    setPageSize: useCallback((pageSize: number, nextPage = 0) => {
      dispatch({ type: 'SET_PAGESIZE', pageSize, nextPage });
    }, []),
  };
}

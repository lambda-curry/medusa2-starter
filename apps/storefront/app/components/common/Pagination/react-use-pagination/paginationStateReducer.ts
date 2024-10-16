import { limitPageBounds, PaginationState } from './getPaginationMeta';

type CurrentPageActions = { type: 'NEXT_PAGE' } | { type: 'PREVIOUS_PAGE' } | { type: 'SET_PAGE'; page: number };

type TotalItemsActions = {
  type: 'SET_TOTALITEMS';
  totalItems: number;
  nextPage?: number;
};

type PageSizeActions = {
  type: 'SET_PAGESIZE';
  pageSize: number;
  nextPage?: number;
};

type PaginationStateReducerActions = CurrentPageActions | TotalItemsActions | PageSizeActions;

const getCurrentPageReducer = (rootState: PaginationState) =>
  function currentPageReducer(state: PaginationState['currentPage'], action: PaginationStateReducerActions) {
    switch (action.type) {
      case 'SET_PAGE':
        return limitPageBounds(rootState.totalItems, rootState.pageSize)(action.page);
      case 'NEXT_PAGE':
        return limitPageBounds(rootState.totalItems, rootState.pageSize)(state + 1);
      case 'PREVIOUS_PAGE':
        return limitPageBounds(rootState.totalItems, rootState.pageSize)(state - 1);
      case 'SET_PAGESIZE':
        return limitPageBounds(rootState.totalItems, action.pageSize)(action.nextPage ?? state);
      case 'SET_TOTALITEMS':
        return limitPageBounds(action.totalItems, rootState.pageSize)(action.nextPage ?? state);
      /* istanbul ignore next */
      default:
        return state;
    }
  };

function totalItemsReducer(state: PaginationState['totalItems'], action: TotalItemsActions) {
  switch (action.type) {
    case 'SET_TOTALITEMS':
      return action.totalItems;
    default:
      return state;
  }
}

function pageSizeReducer(state: PaginationState['pageSize'], action: PageSizeActions) {
  switch (action.type) {
    case 'SET_PAGESIZE':
      return action.pageSize;
    default:
      return state;
  }
}

export function paginationStateReducer(state: PaginationState, action: PaginationStateReducerActions): PaginationState {
  return {
    currentPage: getCurrentPageReducer(state)(state.currentPage, action as CurrentPageActions),
    totalItems: totalItemsReducer(state.totalItems, action as TotalItemsActions),
    pageSize: pageSizeReducer(state.pageSize, action as PageSizeActions),
  };
}

export interface ReducerAction {
  name: string;
  payload?: any;
}

export type ReducerActionHandler<S> = (state: S, payload?: any) => S;

export interface ReducerActionHandlers<S> {
  [x: string]: ReducerActionHandler<S>;
}

export interface CreateReducerConfig<S, A> {
  actionHandlers: ReducerActionHandlers<S>;
  middleware?: (state: S, action: A) => void;
}

export const createReducer = <S, A extends ReducerAction>({
  actionHandlers,
  middleware,
}: CreateReducerConfig<S, A>) => {
  return (state: S, action: A) => {
    const actionHandler = actionHandlers[action.name];

    if (!actionHandler) throw new Error(`Unhandled action type: ${action.name}`);

    if (middleware) middleware(state, action);

    const newState = actionHandler(state, action.payload);

    return newState;
  };
};

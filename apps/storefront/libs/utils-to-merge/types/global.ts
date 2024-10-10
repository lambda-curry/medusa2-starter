import { Dispatch } from 'react';

export interface ContextValue<S, T> {
  state: S;
  dispatch: Dispatch<T>;
}

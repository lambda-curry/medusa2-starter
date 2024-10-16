import { createReducer } from '@libs/util/createReducer';
import type { ContextValue } from '../../types';
import merge from 'lodash/merge';
import type { FC, PropsWithChildren } from 'react';
import { createContext, useReducer } from 'react';

export interface StorefrontState {
  cart: { open?: boolean };
  login: { open?: boolean; redirect?: string };
  search: { open?: boolean };
}

export enum SettableTargets {
  login = 'login',
  search = 'search',
}

export enum ToggleableTargets {
  cart = 'cart',
  login = 'login',
  search = 'search',
}

export interface SetPayload<T extends SettableTargets> {
  state: Partial<StorefrontState[T]>;
}

export interface SetPayloadWithTarget<T extends SettableTargets> extends SetPayload<T> {
  target: T;
}

export interface TogglePayload<T extends ToggleableTargets> {
  open?: boolean;
  state?: Partial<StorefrontState[T]>;
}

export interface TogglePayloadWithTarget<T extends ToggleableTargets> extends TogglePayload<T> {
  target: T;
}

export enum StorefrontActionNames {
  toggle = 'toggle',
  set = 'set',
}

export type StorefrontAction =
  | {
      name: StorefrontActionNames.set;
      payload: SetPayloadWithTarget<SettableTargets>;
    }
  | {
      name: StorefrontActionNames.toggle;
      payload: TogglePayloadWithTarget<ToggleableTargets>;
    };

export type StorefrontContextValue = ContextValue<StorefrontState, StorefrontAction>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StorefrontContext = createContext<StorefrontContextValue>(null as any);

const actionHandlers = {
  set: (state: StorefrontState, { target, state: newTargetState }: SetPayloadWithTarget<SettableTargets>) => ({
    ...state,
    [target]: merge({}, state[target], newTargetState),
  }),
  toggle: (
    state: StorefrontState,
    { target, open, state: newTargetState }: TogglePayloadWithTarget<ToggleableTargets>,
  ) => ({
    ...state,
    [target]: merge({}, state[target], newTargetState, {
      open: open ?? !state[target].open,
    }),
  }),
};

const reducer = createReducer({ actionHandlers });

export const storefrontInitialState: StorefrontState = {
  cart: {} as StorefrontState['cart'],
  login: {} as StorefrontState['login'],
  search: {} as StorefrontState['search'],
};

export interface StorefrontProviderProps extends PropsWithChildren {
  data: Partial<StorefrontState>;
}

export const StorefrontProvider: FC<StorefrontProviderProps> = ({ data, ...props }) => {
  const [state, dispatch] = useReducer(reducer, storefrontInitialState);

  // NOTE: `data` needs to pass directly to the provider for remix rehydration to work.
  return <StorefrontContext.Provider value={{ state: merge({}, state, data), dispatch }} {...props} />;
};

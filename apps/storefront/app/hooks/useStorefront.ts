import { useContext } from 'react';
import {
  StorefrontAction,
  StorefrontActionNames,
  StorefrontContext,
  StorefrontContextValue,
  ToggleableTargets,
  TogglePayload,
} from '@app/providers/storefront-provider';

const toggleActionDispatch: (
  target: ToggleableTargets,
  payload?: TogglePayload<ToggleableTargets> | boolean,
) => StorefrontAction = (target, payload?) => {
  return typeof payload === 'boolean'
    ? { name: StorefrontActionNames.toggle, payload: { open: payload, target } }
    : { name: StorefrontActionNames.toggle, payload: { ...payload, target } };
};

const actions = ({ dispatch }: StorefrontContextValue) => ({
  toggleCartDrawer: (payload?: TogglePayload<ToggleableTargets.cart> | boolean) =>
    dispatch(toggleActionDispatch(ToggleableTargets.cart, payload)),
  toggleLoginModal: (payload?: TogglePayload<ToggleableTargets.login> | boolean) =>
    dispatch(toggleActionDispatch(ToggleableTargets.login, payload)),
  toggleSearchDrawer: (payload?: boolean) => dispatch(toggleActionDispatch(ToggleableTargets.search, payload)),
});

export const useStorefront = () => {
  const context = useContext(StorefrontContext);

  if (!context) throw new Error('useStorefront must be used within a StorefrontContext.Provider');
  return { ...context, actions: actions(context) };
};

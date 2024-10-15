import { useStorefront } from './useStorefront';

export const useLogin = () => {
  const { state, actions } = useStorefront();

  if (!state.login) throw new Error('useLogin must be used within the StorefrontContext.Provider');

  return { login: state.login, toggleLoginModal: actions.toggleLoginModal };
};

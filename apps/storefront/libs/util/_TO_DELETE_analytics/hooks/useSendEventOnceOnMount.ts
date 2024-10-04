import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { useHydrated } from 'remix-utils/use-hydrated';

export const useSendEventOnceOnMount = (effect: () => void, deps = [], delay = 100) => {
  const isHydrated = useHydrated();
  const debouncedEffect = useCallback(
    debounce(() => {
      if (!isHydrated) return;

      effect();
    }, delay),
    [isHydrated],
  );

  useEffect(() => {
    debouncedEffect();
    return () => debouncedEffect.cancel();
  }, [debouncedEffect].concat(deps));
};

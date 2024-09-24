import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { useHydrated } from 'remix-utils/use-hydrated';

export const useSendEventOncePerSession = (id: string, effect: () => void, deps = [], delay = 100) => {
  const isHydrated = useHydrated();
  const debouncedEffect = useCallback(
    debounce(() => {
      if (!isHydrated) return;

      if (id && sessionStorage.getItem(`eventSent_${String(id)}`)) return;

      if (!id) {
        effect();
        return;
      }

      effect();
      sessionStorage.setItem(`eventSent_${String(id)}`, 'true');
    }, delay),
    [isHydrated],
  );

  useEffect(() => {
    debouncedEffect();
    return () => debouncedEffect.cancel();
  }, [debouncedEffect].concat(deps));
};

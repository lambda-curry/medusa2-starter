/* `useLocalStorage` src: https://gist.github.com/Mon4ik/2636100f5b74ee14e35cf283700616fe
 *
 * Features:
 *  - JSON Serializing
 *  - Also value will be updated everywhere, when value updated (via `storage` event)
 */

import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, defaultValue?: T): [T | undefined, (value: T) => void] {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const item = localStorage.getItem(key);

    if (!item && defaultValue) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
    }

    setValue(item ? JSON.parse(item) : defaultValue);

    function handler(e: StorageEvent) {
      if (e.key !== key) return;

      const lsi = localStorage.getItem(key);
      setValue(JSON.parse(lsi ?? ''));
    }

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setValueWrap = (value: T) => {
    if (!value) return;
    try {
      setValue(value);

      localStorage.setItem(key, JSON.stringify(value));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', { key }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return [value, setValueWrap];
}

export function useSessionStorage<T>(key: string, defaultValue?: T): [T | undefined, (value: T) => void] {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const item = sessionStorage.getItem(key);

    if (!item && defaultValue !== undefined) {
      sessionStorage.setItem(key, JSON.stringify(defaultValue));
    }

    setValue(item ? JSON.parse(item) : defaultValue);

    function handler(e: StorageEvent) {
      if (e.key !== key) return;

      const ssi = sessionStorage.getItem(key);
      setValue(ssi ? JSON.parse(ssi) : defaultValue);
    }

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [key, defaultValue]);

  const setValueWrap = (value: T) => {
    if (value === undefined) return;
    try {
      setValue(value);

      sessionStorage.setItem(key, JSON.stringify(value));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', { key, storageArea: sessionStorage }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return [value, setValueWrap];
}

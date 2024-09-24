import LRU from 'lru-cache';

export const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;
export const ONE_DAY = 1000 * 60 * 60 * 24;

export const useCache = async <T>(
  cache: LRU<string, any>,
  key: string,
  fn: () => Promise<T>,
  options: LRU.SetOptions<string, any>
) => {
  const cached = cache.get(key);
  if (cached) return cached;
  const result = await fn();
  cache.set(key, result, options);
  return result;
};

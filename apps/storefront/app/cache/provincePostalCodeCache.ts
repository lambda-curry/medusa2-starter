import LRU from 'lru-cache';

declare global {
  var __provincePostalCodeCache: LRU<string, any>;
}
function getCache() {
  if (process.env.NODE_ENV === 'production') {
    return new LRU<string, any>({ max: 200 });
  } else {
    if (!global.__provincePostalCodeCache) {
      global.__provincePostalCodeCache = new LRU<string, any>({ max: 200 });
    }
    return global.__provincePostalCodeCache;
  }
}

export const provincePostalCodeCache: LRU<string, any> = getCache();

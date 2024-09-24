import LRU from 'lru-cache';
export const fontLinksCache: LRU<string, string> = new LRU<string, string>({ max: 200 });

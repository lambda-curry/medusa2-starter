import { Tenant } from '@markethaus/shared-types';
import LRU, { type Options as CacheOptions } from 'lru-cache';

const cacheOptions: CacheOptions<string, Tenant[]> = { max: 200 };
export const marketplacesCache = new LRU(cacheOptions);

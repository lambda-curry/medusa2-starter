import cachified from '@epic-web/cachified';
import { sdk, sdkCache } from '@libs/util/server/client.server';
import { withAuthHeaders } from '../auth.server';
import { MILLIS } from '../cache-builder.server';

import {
  StoreListProductReviewStatsQuery,
  StoreListProductReviewsQuery,
  StoreUpsertProductReviewsDTO,
} from '@lambdacurry/medusa-plugins-sdk';

import { MemoryFileStorage } from '@mjackson/file-storage/memory';
import { FileUpload } from '@mjackson/form-data-parser';
export const fetchProductReviews = async (
  query: Partial<StoreListProductReviewsQuery> = {},
  cacheOptions: { forceFresh?: boolean } = {},
) => {
  return await cachified({
    key: `product-reviews-${JSON.stringify(query)}`,
    cache: sdkCache,
    staleWhileRevalidate: MILLIS.ONE_HOUR,
    ttl: MILLIS.TEN_SECONDS,
    forceFresh: cacheOptions.forceFresh,
    async getFreshValue() {
      return await sdk.store.productReviews.list({
        ...query,
        offset: query.offset ?? 0,
        limit: query.limit ?? 10,
      });
    },
  });
};

export const fetchProductReviewStats = async (query: StoreListProductReviewStatsQuery = { offset: 0, limit: 10 }) => {
  return await cachified({
    key: `product-review-stats-${JSON.stringify(query)}`,
    cache: sdkCache,
    staleWhileRevalidate: MILLIS.ONE_HOUR,
    ttl: MILLIS.TEN_SECONDS,
    async getFreshValue() {
      return await sdk.store.productReviews.listStats(query);
    },
  });
};

export const upsertProductReviews = withAuthHeaders(
  async (request, authHeaders, data: StoreUpsertProductReviewsDTO) => {
    return await sdk.store.productReviews.upsert(data, authHeaders);
  },
);

export const memoryStorage = new MemoryFileStorage();

export const reviewsFileUploadHandler = async (fileUpload: FileUpload) => {
  const randomId = Math.random().toString(36).substring(2, 15);
  if (fileUpload.type.startsWith('image/')) {
    const storageKey = `${randomId}-${fileUpload.fieldName}`;

    // FileUpload objects are not meant to stick around for very long (they are
    // streaming data from the request.body); store them as soon as possible.
    await memoryStorage.set(storageKey, fileUpload as unknown as File);

    // Return a File for the FormData object. This is a LazyFile that knows how
    // to access the file's content if needed (using e.g. file.stream()) but
    // waits until it is requested to actually read anything.
    return memoryStorage.get(storageKey);
  }
  return null;
};

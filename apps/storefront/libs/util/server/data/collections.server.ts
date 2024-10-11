import { sdk } from '@libs/util/server/client.server';
import { HttpTypes } from '@medusajs/types';

// TODO: CHECK IF ANYTHING on this file needs to be cached
export const retrieveCollection = async function (id: string) {
  return sdk.store.collection
    .retrieve(id, {}, { next: { tags: ['collections'] } })
    .then(({ collection }) => collection);
};

export const getCollectionsList = async function (
  offset: number = 0,
  limit: number = 100
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.store.collection
    .list({ limit, offset: 0 }, { next: { tags: ['collections'] } })
    .then(({ collections }) => ({ collections, count: collections.length }));
};

export const getCollectionByHandle = async function (
  handle: string
): Promise<HttpTypes.StoreCollection> {
  return sdk.store.collection
    .list({ handle }, { next: { tags: ['collections'] } })
    .then(({ collections }) => collections[0]);
};

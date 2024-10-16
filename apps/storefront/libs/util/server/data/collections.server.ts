import { medusaError } from '@libs/util/medusaError';
import { sdk } from '@libs/util/server/client.server';
import { HttpTypes } from '@medusajs/types';

export const retrieveCollection = async function (id: string) {
  return sdk.store.collection.retrieve(id, {}).then(({ collection }) => collection);
};

export const getCollectionsList = async function (
  offset: number = 0,
  limit: number = 100,
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.store.collection
    .list({ limit, offset: 0 })
    .then(({ collections }) => ({ collections, count: collections.length }));
};

export const getCollectionByHandle = async function (handle: string): Promise<HttpTypes.StoreCollection> {
  return sdk.store.collection
    .list({ handle })
    .then(({ collections }) => collections[0])
    .catch(medusaError);
};

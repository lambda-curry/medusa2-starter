import { sdk } from "@libs/util/server/client.server"
import { getProductsList } from "./products.server"
import { HttpTypes } from "@medusajs/types"

// TODO: CHECK IF ANYTHING on this file needs to be cached
export const retrieveCollection = async function (id: string) {
  return sdk.store.collection
    .retrieve(id, {}, { next: { tags: ["collections"] } })
    .then(({ collection }) => collection)
}

export const getCollectionsList = async function (
  offset: number = 0,
  limit: number = 100,
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> {
  return sdk.store.collection
    .list({ limit, offset: 0 }, { next: { tags: ["collections"] } })
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async function (
  handle: string,
): Promise<HttpTypes.StoreCollection> {
  return sdk.store.collection
    .list({ handle }, { next: { tags: ["collections"] } })
    .then(({ collections }) => collections[0])
}

export const getCollectionsWithProducts = async (
  countryCode: string,
): Promise<HttpTypes.StoreCollection[] | null> => {
  const { collections } = await getCollectionsList(0, 3)

  if (!collections) {
    return null
  }

  const collectionIds = collections
    .map((collection) => collection.id)
    .filter(Boolean) as string[]

  const { response } = await getProductsList({
    queryParams: { collection_id: collectionIds },
    countryCode,
  })

  response.products.forEach((product) => {
    const collection = collections.find(
      (collection) => collection.id === product.collection_id,
    )

    if (collection) {
      if (!collection.products) {
        collection.products = []
      }

      collection.products.push(product as any)
    }
  })

  return collections as unknown as HttpTypes.StoreCollection[]
}

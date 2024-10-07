import { BasePageSection } from "@libs/util/medusa/types"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { fetchProducts } from "./products.server"
import {
  HttpTypes,
  StoreCollection,
  StoreProductCategory,
} from "@medusajs/types"
import { getCountryCode, getDefaultRegion } from "./data/regions.server"
import { home as homePage } from "@libs/config/pages/home"
import { getOrSetCart } from "./data/cart.server"

export const getHomePage = async (loaderArgs: LoaderFunctionArgs) => {
  const { request } = loaderArgs

  return homePage
}

export type MappedDataSections = BasePageSection<any> // TODO: CHECK IF THIS IS STILL REQUIRED

export const getProductListData = async (request: Request) => {
  const producstQuery: HttpTypes.StoreProductParams = {
    limit: 10,
    offset: 0,
  }

  const defaultRegion = await getDefaultRegion()
  const [firstCountry] = defaultRegion.countries || []

  const cart = await getOrSetCart(request, getCountryCode(firstCountry))

  const { products } = await fetchProducts(request, {
    ...producstQuery,
    currency_code: cart.currency_code,
    region_id: cart.region_id,
    fields: "id,title,handle,thumbnail,variants.*,variants.prices.*",
    // fields:
    //   producstQuery.fields ??
    //   "id,title,handle,thumbnail,variants,categories,collection", // TODO: CHECK IF FIELDS ARE CORRECT
  })
  const collectionTabs = new Map<string, StoreCollection>()
  const categoryTabs = new Map<string, StoreProductCategory>()

  products.forEach((product) => {
    product?.categories?.forEach((category) => {
      categoryTabs.set(category.id, category)
    })

    if (product.collection) {
      collectionTabs.set(product.collection.id, product.collection)
    }
  })

  return {
    products,
    collection_tabs: [...collectionTabs.values()],
    category_tabs: [...categoryTabs.values()],
  }
}

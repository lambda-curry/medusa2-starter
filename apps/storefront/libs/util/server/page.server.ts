import {
  HeroData,
  Page,
  BasePageSection,
  PageSectionType,
  ProductListSectionData,
} from "@libs/util/medusa/types"
// import { createMedusaClient } from "@libs/util/server/client.server"
import type { LoaderFunctionArgs } from "@remix-run/node"
import { Params } from "@remix-run/react"
// import { withProductsAndReviewStats } from "./reviews.server"
import { withPaginationParams } from "@libs/util/remix"
import { fetchProducts } from "./products.server"
import {
  HttpTypes,
  StoreCollection,
  StoreProductCategory,
} from "@medusajs/types"
import { getRegion } from "./data/regions.server"
import { getCartSession } from "./cart-session.server"
import { home as homePage } from "@libs/config/pages/home"

// export const getPost = async (loaderArgs: LoaderFunctionArgs) => {
//   const { request, params } = loaderArgs

//   try {
//     const client = await createMedusaClient({ request })
//     const { post } = await client.posts.retrieve(params.postHandle ?? "")

//     if (!post) return null

//     return post
//   } catch (error) {
//     return null
//   }
// }

export const getHomePage = async (loaderArgs: LoaderFunctionArgs) => {
  const { request } = loaderArgs
  return homePage

  // try {

  //   const { post } = await client.posts.retrieveHomePage()

  //   if (!post) return null

  //   return post
  // } catch (error) {
  //   return null
  // }
}

export type MappedDataSections = BasePageSection<
  ProductListSectionData | HeroData
>

export const getProductListData = async (
  request: Request,
  pageSection: ProductListSectionData,
) => {
  const producstQuery: HttpTypes.StoreProductParams = {
    limit: 10,
    offset: 0,
  }

  const cart = await getCartSession(request.headers)
  console.log("🚀 ~ cart:", cart)
  const { products } = await fetchProducts(request, {
    ...producstQuery,
    currency_code: cart.currencyCode,
    region_id: cart.regionId,
    fields: "id,title,handle,thumbnail,variants.*,variants.prices.*",
    // fields:
    //   producstQuery.fields ??
    //   "id,title,handle,thumbnail,variants,categories,collection", // TODO: CHECK IF FIELDS ARE CORRECT
  })
  const collectionTabs = new Map<string, StoreCollection>()
  const categoryTabs = new Map<string, StoreProductCategory>()

  console.log("🚀 ~ products.forEach ~ products:", products)
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

export interface PostDataArgs {
  page: Page
  request: Request
  params: Params<string>
}

const PageSectionDataMap: Partial<
  Record<
    PageSectionType,
    (request: Request, pageSection: MappedDataSections) => Promise<any>
  >
> = {
  [PageSectionType.PRODUCT_CAROUSEL]: getProductListData,
  [PageSectionType.PRODUCT_GRID]: getProductListData,
} as const

export const fetchPageData = ({
  request,
  params,
  page,
}: PostDataArgs): Record<string, Promise<any>> => {
  if (!page) return {}

  return page.sections.reduce((acc, section) => {
    if (!(section.type in PageSectionDataMap)) return acc

    const data = PageSectionDataMap[section.type]?.(
      request,
      section as MappedDataSections,
    )
    if (data) acc[section.id] = data
    return acc
  }, {} as Record<string, Promise<any>>)
}

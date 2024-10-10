// import {
//   createMedusaClient,
//   type Medusa,
// } from '@libs/util/medusa/client.server';
import { SiteDetailsRootData, type SiteSettings } from "@libs/util/medusa/types"
// import type {
//   Customer,
//   PricedProduct,
//   ProductCategory,
//   ProductCollection,
//   ProductTag,
//   Region,
//   StoreCartsRes,
// } from '@markethaus/storefront-client';
import { LoaderFunctionArgs } from "@remix-run/node"
import { fontLinksCache } from "~/cache/fontLinksCache"
import { ONE_WEEK, useCache } from "@libs/utils-to-merge/use-cache"
import { config } from "./config.server"
import { getCartId } from "./cookies.server"
import { enrichLineItems, getOrSetCart } from "./data/cart.server"
import {
  getCountryCode,
  getDefaultRegion,
  listRegions,
} from "./data/regions.server"
import { sdk } from "./client.server"
import { HttpTypes, StoreRegion } from "@medusajs/types"
import { siteSettings } from "@libs/config/site/site-settings"
import {
  footerNavigationItems,
  headerNavigationItems,
} from "@libs/config/site/navigation-items"
import { getCustomer } from "./data/customer.server"

// const searchPromise = (medusa: Medusa) => {
//   return Promise.all([
//     medusa.products.list({ limit: 10 }).then((res) => res.products) as Promise<
//       PricedProduct[]
//     >,
//     medusa.productCollections
//       .list({ limit: 20 })
//       .then((res) => res.collections) as Promise<ProductCollection[]>,
//     medusa.productCategories
//       .list({ limit: 20 })
//       .then((res) => res.product_categories) as Promise<ProductCategory[]>,
//     medusa.productTags
//       .list({ limit: 20 })
//       .then((res) => res.product_tags) as Promise<ProductTag[]>,
//   ]).then(([products, collections, categories, tags]) => ({
//     products,
//     collections,
//     categories,
//     tags,
//   }))
// }

const fetchHasProducts = async () => {
  return await sdk.store.product
    .list({ limit: 1, offset: 999_999 })
    .then((res) => res.count > 0)
}

export const getRootLoader = async ({ request }: LoaderFunctionArgs) => {
  const region = await getDefaultRegion() // TODO: make region param dynamic?
  const [firstCountry] = region?.countries ?? []

  const [cart, regions, customer, hasPublishedProducts] = await Promise.all([
    getOrSetCart(request, getCountryCode(firstCountry)!), // TODO: make region param dynamic?
    listRegions(),
    getCustomer(request),
    fetchHasProducts(),
  ])

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  const fontLinks: string[] = []

  return {
    // searchPromise: searchPromise(medusa),
    hasPublishedProducts,
    fontLinks,
    env: {
      NODE_ENV: config.NODE_ENV,
      ENVIRONMENT: config.ENVIRONMENT,
      STRIPE_PUBLIC_KEY: config.STRIPE_PUBLIC_KEY,
      PUBLIC_MEDUSA_API_URL: config.PUBLIC_MEDUSA_API_URL,
      STOREFRONT_URL: config.STOREFRONT_URL,
      SENTRY_DSN: config.SENTRY_DSN,
      SENTRY_ENVIRONMENT: config.SENTRY_ENVIRONMENT,
      EVENT_LOGGING: config.EVENT_LOGGING,
    },
    customer,
    regions,
    region,
    siteDetails: {
      store: {
        name: "BARRIO",
      },
      settings: siteSettings,
      headerNavigationItems,
      footerNavigationItems,
    } as SiteDetailsRootData,
    cart: cart,
  }
}

export type RootLoader = typeof getRootLoader

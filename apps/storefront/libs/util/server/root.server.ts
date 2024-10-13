import type { SiteDetailsRootData } from '@libs/util/medusa/types'

import {
  footerNavigationItems,
  headerNavigationItems,
} from '@libs/config/site/navigation-items'
import { siteSettings } from '@libs/config/site/site-settings'
import type { HttpTypes } from '@medusajs/types'
import { type LoaderFunctionArgs, unstable_data } from '@remix-run/node'
import { sdk } from './client.server'
import { config } from './config.server'
import { getSelectedRegionId, setSelectedRegionId } from './cookies.server'
import { enrichLineItems, retrieveCart } from './data/cart.server'
import { getCustomer } from './data/customer.server'
import { getSelectedRegion, listRegions } from './data/regions.server'

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
  const region = await getSelectedRegion(request.headers)

  const [cart, regions, customer, hasPublishedProducts] = await Promise.all([
    retrieveCart(request), // TODO: make region param dynamic?
    listRegions(),
    getCustomer(request),
    fetchHasProducts(),
  ])

  const headers = new Headers()
  const currentRegionCookieId = await getSelectedRegionId(headers)

  if (currentRegionCookieId !== region?.id) {
    await setSelectedRegionId(headers, region?.id!)
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!)
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[]
  }

  const fontLinks: string[] = []

  return unstable_data(
    {
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
          name: 'BARRIO',
        },
        settings: siteSettings,
        headerNavigationItems,
        footerNavigationItems,
      } as SiteDetailsRootData,
      cart: cart,
    },
    { headers },
  )
}

export type RootLoader = typeof getRootLoader

import type { Vendor } from '@libs/utils-to-merge/medusa/types'
import type { MetaFunction } from '@remix-run/node'
import { getCommonMeta, getParentMeta, mergeMeta } from './meta'
import { getPostMeta } from './posts'
import { StoreCart } from '@medusajs/types'

export const getVendorMeta: MetaFunction<any> = ({
  data,
}: {
  data: { vendor: Vendor }
}) => {
  const vendor = data.vendor

  if (!vendor) return []

  const title = vendor?.name
  const description = vendor?.description
  const ogTitle = title
  const ogDescription = description
  const ogImage = vendor?.logo?.url
  const ogImageAlt = !!ogImage ? `${vendor?.name} logo` : undefined

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: ogTitle },
    { property: 'og:description', content: ogDescription },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: ogImageAlt },
  ]
}

export const getMergedVendorMeta = mergeMeta(
  getParentMeta,
  getCommonMeta,
  getVendorMeta,
  getPostMeta,
)

export const getCartShippingProfileIds = (cart: StoreCart) => {
  const profileIds = cart.items
    ?.map((item) => {
      return item?.variant?.product?.profile_id
    })
    .filter(Boolean)

  return [...new Set(profileIds)]
}

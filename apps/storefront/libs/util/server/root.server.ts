import type { SiteDetailsRootData } from '@libs/types';

import { footerNavigationItems, headerNavigationItems } from '@libs/config/site/navigation-items';
import { siteSettings } from '@libs/config/site/site-settings';
import type { HttpTypes } from '@medusajs/types';
import { type LoaderFunctionArgs, data as remixData } from '@remix-run/node';
import { config } from './config.server';
import { getSelectedRegionId, setSelectedRegionId } from './cookies.server';
import { enrichLineItems, retrieveCart } from './data/cart.server';
import { getCustomer } from './data/customer.server';
import { getSelectedRegion, listRegions } from './data/regions.server';
import { fetchProducts } from './products.server';
import { RemixLoaderResponse } from 'types/remix';

const fetchHasProducts = async (request: Request) => {
  return await fetchProducts(request, { limit: 1, offset: 999_999 }).then((res) => res.count > 0);
};

export const getRootLoader = async ({ request }: LoaderFunctionArgs) => {
  const region = await getSelectedRegion(request.headers);

  const [cart, regions, customer, hasPublishedProducts] = await Promise.all([
    retrieveCart(request),
    listRegions(),
    getCustomer(request),
    fetchHasProducts(request),
  ]);

  const headers = new Headers();
  const currentRegionCookieId = await getSelectedRegionId(headers);

  if (currentRegionCookieId !== region?.id) {
    await setSelectedRegionId(headers, region?.id!);
  }

  if (cart?.items?.length) {
    const enrichedItems = await enrichLineItems(cart?.items, cart?.region_id!);
    cart.items = enrichedItems as HttpTypes.StoreCartLineItem[];
  }

  const fontLinks: string[] = [];

  return remixData(
    {
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
  );
};

export type RootLoader = typeof getRootLoader;

export type RootLoaderResonse = RemixLoaderResponse<typeof getRootLoader>['data'];

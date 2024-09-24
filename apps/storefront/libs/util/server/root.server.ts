import { generateCSSVariablesInnerHTML } from '@marketplace/util/css';
import {
  createMedusaClient,
  type Medusa,
} from '@marketplace/util/medusa/client.server';
import {
  type SiteDetailsRootData,
  type SiteSettings,
} from '@marketplace/util/medusa/types';
import type {
  Customer,
  PricedProduct,
  ProductCategory,
  ProductCollection,
  ProductTag,
  Region,
  StoreCartsRes,
} from '@markethaus/storefront-client';
import { LoaderFunctionArgs } from '@remix-run/node';
import { type AxiosError } from 'axios';
import { fontLinksCache } from '~/cache/fontLinksCache';
import { ONE_WEEK, useCache } from '@utils/use-cache';
import { destroyCartSession, getCartSession } from './cart-session.server';
import { config } from './config.server';
import { getCookie } from './cookies.server';
import { getTenantAdminUrlByHostname } from './orchestrator.server';

const checkEmail = async (
  email: string | null,
  medusa: Medusa
): Promise<boolean | undefined> => {
  if (!email) return;

  try {
    const { exists } = await medusa.auth.exists(email);
    return exists;
  } catch (ex) {
    return;
  }
};

const fetchCart: (params: {
  medusa: Medusa;
  cartId?: string;
  responseHeaders: Headers;
}) => Promise<
  | (StoreCartsRes['cart'] & {
      open?: boolean;
    })
  | null
> = async ({ medusa, cartId, responseHeaders }) => {
  if (!cartId) return null;

  let cart;
  try {
    const response = await medusa.carts.retrieve(cartId);
    return response.cart;
  } catch (e) {
    // no cart exists with that id
    if (
      typeof e === 'object' &&
      e &&
      (e as AxiosError)?.response?.status === 404
    ) {
      await destroyCartSession(responseHeaders);
    }
  }

  return cart ? cart : (await medusa.carts.create({})).cart;
};

export const fetchCustomer = async ({
  medusa,
  headers,
  responseHeaders,
}: {
  medusa: Medusa;
  headers: Headers;
  responseHeaders: Headers;
}): Promise<Omit<Customer, 'password_hash'> | undefined> => {
  const hasAuthCookie = await getCookie(headers, config.AUTH_COOKIE_NAME);
  if (!hasAuthCookie) return undefined;

  try {
    const { customer } = await medusa.auth.getSession();
    return customer;
  } catch (ex) {
    return;
  }
};
const searchPromise = (medusa: Medusa) => {
  return Promise.all([
    medusa.products.list({ limit: 10 }).then(res => res.products) as Promise<
      PricedProduct[]
    >,
    medusa.productCollections
      .list({ limit: 20 })
      .then(res => res.collections) as Promise<ProductCollection[]>,
    medusa.productCategories
      .list({ limit: 20 })
      .then(res => res.product_categories) as Promise<ProductCategory[]>,
    medusa.productTags
      .list({ limit: 20 })
      .then(res => res.product_tags) as Promise<ProductTag[]>,
  ]).then(([products, collections, categories, tags]) => ({
    products,
    collections,
    categories,
    tags,
  }));
};

const selectRegion = (regions: Region[]) => {
  return regions[0];
};

const fetchRegions = async (medusa: Medusa) => {
  const { regions } = await medusa.regions.list({});
  return regions;
};

export const fetchFontCss = async (siteSettings: SiteSettings) => {
  if (!siteSettings.display_font && !siteSettings.body_font) return '';

  const googleFontsUrl = new URL(
    'https://fonts.googleapis.com/css2?display=swap'
  );

  if (siteSettings?.display_font)
    googleFontsUrl.searchParams.append(
      'family',
      siteSettings.display_font.family.replace(' ', '+')
    );

  if (siteSettings?.body_font)
    googleFontsUrl.searchParams.append(
      'family',
      siteSettings.body_font.family.replace(' ', '+')
    );

  const fontCssUrl = decodeURIComponent(googleFontsUrl.toString());

  try {
    return await useCache(
      fontLinksCache,
      fontCssUrl,
      async () => {
        const cssResponse = await fetch(fontCssUrl);
        const css = await cssResponse.text();
        return css;
      },
      { ttl: ONE_WEEK }
    );
  } catch (ex) {
    console.error('Failed to fetch CSS', ex);
    return '';
  }
};

const getGoogleFontsUrls = (siteSettings: SiteSettings): string[] => {
  const urls: string[] = [];

  urls.push('/storefront-fonts.css');

  return urls;
};

const fetchHasProducts = async (medusa: Medusa) =>
  await medusa.products
    .list({ limit: 1, offset: 999_999 })
    .then(res => res.count > 0);

const fetchSiteDetails = async (
  medusa: Medusa,
  request: Request
): Promise<SiteDetailsRootData> => {
  const { store, site_settings, feature_flags, navigation_items } =
    await medusa.siteSettings.retrieve();

  const header_navigation_items = navigation_items
    .filter(item => item.location === 'header')
    .sort((a, b) => a.sort_order - b.sort_order);

  const footer_navigation_items = navigation_items
    .filter(item => item.location === 'footer')
    .sort((a, b) => a.sort_order - b.sort_order);

  const url = new URL(request.url);
  const admin_url = await getTenantAdminUrlByHostname(url.hostname);
  return {
    store,
    site_settings,
    feature_flags,
    header_navigation_items,
    footer_navigation_items,
    admin_url,
  };
};

export const getRootLoader = async ({ request }: LoaderFunctionArgs) => {
  const medusa = await createMedusaClient({ request });
  const { cartId } = await getCartSession(request.headers);

  const responseHeaders = new Headers();

  const [siteDetails, customer, cart, regions, hasPublishedProducts] =
    await Promise.all([
      fetchSiteDetails(medusa, request),
      fetchCustomer({ medusa, headers: request.headers, responseHeaders }),
      fetchCart({ medusa, cartId, responseHeaders }),
      fetchRegions(medusa),
      fetchHasProducts(medusa),
    ]);

  const emailExists = customer
    ? undefined
    : cart
    ? await checkEmail(cart.email, medusa)
    : undefined;

  const fontCss = await fetchFontCss(siteDetails.site_settings);

  const googleFontsUrl = getGoogleFontsUrls(siteDetails.site_settings);

  const fontLinks: string[] = [];

  const region = selectRegion(regions);

  const globalCSS =
    generateCSSVariablesInnerHTML({ ...siteDetails.site_settings }) +
    `${
      siteDetails.site_settings?.global_css
        ? siteDetails.site_settings?.global_css
        : ''
    }` +
    fontCss;

  return {
    searchPromise: searchPromise(medusa),
    hasPublishedProducts,
    fontLinks,
    googleFontsUrl,
    globalCSS,
    env: {
      NODE_ENV: config.NODE_ENV,
      GOOGLE_ANALYTICS_ID: config.GOOGLE_ANALYTICS_ID,
      ENVIRONMENT: config.ENVIRONMENT,
      STRIPE_PUBLIC_KEY: config.STRIPE_PUBLIC_KEY,
      PUBLIC_MEDUSA_API_URL: config.PUBLIC_MEDUSA_API_URL,
      STOREFRONT_URL: config.STOREFRONT_URL,
      DISABLE_SHIPPING: config.DISABLE_SHIPPING,
      SENTRY_DSN: config.SENTRY_DSN,
      SENTRY_ENVIRONMENT: config.SENTRY_ENVIRONMENT,
      EVENT_LOGGING: config.EVENT_LOGGING,
    },
    customer,
    regions,
    region,
    siteDetails,
    cart: cart
      ? {
          ...cart,
          emailExists,
        }
      : undefined,
  };
};

export type RootLoader = typeof getRootLoader;

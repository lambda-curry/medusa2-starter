import { type AnalyticsBrowser } from '@segment/analytics-next';

declare global {
  interface Window {
    segmentAnalytics: AnalyticsBrowser;

    gtag: Gtag.Gtag;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
  }
}

// TODO: move the klaviyo list id to the admin config for better whitelabel solution
export enum KlaviyoListId {
  AshleyCanadaNewsletter = 'Ux5vu9'
}

export type GA4ItemParams = {
  item_id?: string;
  item_name?: string;
  affiliation?: string;
  coupon?: string;
  discount?: number;
  index?: number;
  item_brand?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
  item_list_id?: string;
  item_list_name?: string;
  item_variant?: string;
  location_id?: string;
  price?: number;
  quantity?: number;
};

export type ShareContentMethods = 'native' | 'copy' | 'Twitter' | 'Facebook';

export type SignUpMethods = 'password';

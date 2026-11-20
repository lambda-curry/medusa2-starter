import { SiteSettings } from '@libs/types';
import { config } from '@libs/util/server/config.server';

export const siteSettings: SiteSettings = {
  storefront_url: config.STOREFRONT_URL,
  description:
    'Chef Velez offers premium private chef experiences in Park City, Salt Lake City, and surrounding areas, including cooking classes, plated dinners, and buffet-style events.',
  favicon: '/favicon.jpg',
  social_facebook: '',
  social_instagram: '',
  social_twitter: '',
};

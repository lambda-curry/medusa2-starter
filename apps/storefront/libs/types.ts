import { BaseAddress, StoreDTO } from '@medusajs/types';
import { BasePaymentSession } from '@medusajs/types/dist/http/payment/common';
import { PaymentMethod as StripePaymentMethod } from '@stripe/stripe-js';

export enum NavigationItemLocation {
  header = 'header',
  footer = 'footer',
}

export interface NavigationItem {
  id: number;
  label: string;
  url: string;
  new_tab: boolean;
  location: NavigationItemLocation;
  sort_order: number;
}

export type NavigationCollection = NavigationItem[];

export interface SiteDetailsRootData {
  store: StoreDTO;
  settings: SiteSettings;
  headerNavigationItems: NavigationCollection;
  footerNavigationItems: NavigationCollection;
}

export enum ButtonStyleVariant {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  LINK = 'link',
}

export interface CustomAction {
  label: string;
  url: string;
  new_tab?: boolean;
  style_variant?: ButtonStyleVariant;
}

export interface ImageField {
  id?: string;
  url?: string;
  alt?: string;
  href?: string;
  width?: number;
  height?: number;
}

export interface ThumbnailImage {
  url?: string;
  alt?: string;
}

export interface Video {
  url?: string;
  loop?: boolean;
  thumbnail?: ThumbnailImage;
}

export interface ProductListFilter {
  q?: string;
  collection_id?: string[];
  tags?: string[];
  category_id?: string[];
  limit?: number;
  order?: string;
}

export interface CreateNewsletterSubscriberReq {
  email: string;
}

export interface NewsletterSubscriberRes {
  success: boolean;
  message: string;
}

export interface SiteSettings {
  description?: string;
  favicon: string;
  social_instagram?: string;
  social_youtube?: string;
  social_facebook?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_pinterest?: string;
  social_tiktok?: string;
  social_snapchat?: string;
  storefront_url?: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  province: string;
  countryCode: string;
  postalCode: string;
  phone?: string | null;
  country?: string | null;
}

export type MedusaAddress = Omit<BaseAddress, 'id' | 'customer_id'>;

export interface ModifiedStripePaymentMethod
  extends Pick<
    StripePaymentMethod,
    'id' | 'object' | 'billing_details' | 'card' | 'created' | 'customer' | 'livemode' | 'metadata' | 'type'
  > {}

export interface CustomPaymentSession extends BasePaymentSession {
  provider_id: string;
  data: ModifiedStripePaymentMethod;
}

export type CreditCardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'jcb' | 'diners' | 'unionpay' | 'unknown';

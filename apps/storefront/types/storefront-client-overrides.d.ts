import { Image as MedusaImage, Store as MedusaStore } from '@markethaus/storefront-client';
import type { Vendor } from '../libs/util/medusa/types';

export type TransitTime =
  | 'same_day'
  | 'next_day'
  | 'one_two_days'
  | 'three_five_days'
  | 'five_seven_days'
  | 'one_two_weeks'
  | 'two_plus_weeks';

declare module '@markethaus/storefront-client' {
  export interface Store extends MedusaStore {
    logo?: MedusaImage;
  }

  export interface StoreGetProductsParams {
    vendor_id?: string | string[];
  }

  export interface Product {
    customer_response_prompt_required: boolean;
    customer_response_prompt: string;
    vendor: Vendor;
    customer_file_uploads_enabled: boolean;
  }

  export interface LineItem {
    customer_product_response?: string;
  }

  export interface ShippingOption {
    transit_time: TransitTime;
  }
}

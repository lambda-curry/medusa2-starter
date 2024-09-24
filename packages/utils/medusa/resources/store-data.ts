import { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import { StoreDataResponse } from '../types';

export interface StoreDataListQueryOptions {
  limit?: number;
  offset?: number;
  id?: string;
  label?: string;
  handle?: string | string[];
}

export class StoreDataResource extends BaseResource {
  retrieve(cartId?: string, customHeaders: Record<string, any> = {}): ResponsePromise<StoreDataResponse> {
    const path = cartId ? `/store/store-data?cart_id=${cartId}` : '/store/store-data';

    return this.client.request('GET', path, {}, {}, customHeaders);
  }
}

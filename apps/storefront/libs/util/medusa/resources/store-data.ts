import { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import { StoreDataResponse } from '../..';
import { BaseHttpRequest } from '@markethaus/storefront-client';

export interface StoreDataListQueryOptions {
  limit?: number;
  offset?: number;
  id?: string;
  label?: string;
  handle?: string | string[];
}

export class StoreDataResource {
  constructor(public readonly client: BaseHttpRequest) {}

  retrieve(cartId?: string, customHeaders: Record<string, any> = {}): ResponsePromise<StoreDataResponse> {
    const path = cartId ? `/store/store-data?cart_id=${cartId}` : '/store/store-data';

    return this.client.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }
}

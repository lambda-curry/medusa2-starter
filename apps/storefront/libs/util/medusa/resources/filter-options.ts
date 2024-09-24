import { BaseHttpRequest, CancelablePromise } from '@markethaus/storefront-client';
import type { ProductFilterOptionsParams, ProductFilterOptionsRes } from '../types';

export class FilterOptionsResource {
  constructor(public readonly client: BaseHttpRequest) {}

  retrieve(
    options: ProductFilterOptionsParams = {},
    customHeaders: Record<string, any> = {}
  ): CancelablePromise<ProductFilterOptionsRes> {
    // remove values if they are an empty array
    const paramEntries = Object.entries(options).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return true;
    });

    const query = new URLSearchParams([...paramEntries]).toString();

    const path = `/store/products/filter-options${query.length > 0 ? `?${query}` : ''}`;

    return this.client.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }
}

import type { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import type { ProductFilterOptionsParams, ProductFilterOptionsRes, SiteSettingsRes } from '../types';

export class FilterOptionsResource extends BaseResource {
  retrieve(
    options: ProductFilterOptionsParams = {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<ProductFilterOptionsRes> {
    // remove values if they are an empty array
    const paramEntries = Object.entries(options).filter(([, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return true;
    });

    const query = new URLSearchParams([...paramEntries]).toString();

    const path = `/store/products/filter-options${query.length > 0 ? `?${query}` : ''}`;

    return this.client.request('GET', path, {}, {}, customHeaders);
  }
}

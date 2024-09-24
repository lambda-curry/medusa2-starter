import qs from 'qs';
import { BaseResource, ResponsePromise } from '@medusajs/medusa-js';
import {
  StoreGetVendorsParams,
  StorePostVendorsContactReq,
  StoreVendorRetrieveRes,
  StoreVendorsContactRes,
  StoreVendorsListRes
} from '../types';

export class VendorsResource extends BaseResource {
  list(query?: StoreGetVendorsParams, customHeaders: Record<string, any> = {}): ResponsePromise<StoreVendorsListRes> {
    let path = '/store/vendors';

    if (query) {
      const queryString = qs.stringify(query);
      path = `${path}?${queryString}`;
    }

    return this.client.request('GET', path, {}, {}, customHeaders);
  }

  retrieve(vendorId: string, customHeaders: Record<string, any> = {}): ResponsePromise<StoreVendorRetrieveRes> {
    const path = `/store/vendors/${vendorId}`;

    return this.client.request('GET', path, {}, {}, customHeaders);
  }

  contact(
    vendorId: string,
    data: StorePostVendorsContactReq,
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<StoreVendorsContactRes> {
    const path = `/store/vendors/${vendorId}/contact`;

    return this.client.request('POST', path, data, {}, customHeaders);
  }
}

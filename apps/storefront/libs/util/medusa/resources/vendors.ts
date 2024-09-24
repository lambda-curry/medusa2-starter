import qs from 'qs';
import { BaseResource, ResponsePromise } from '@medusajs/medusa-js';
import {
  StoreGetVendorsParams,
  StorePostVendorsContactReq,
  StoreVendorRetrieveRes,
  StoreVendorsContactRes,
  StoreVendorsListRes
} from '../types';
import { BaseHttpRequest } from '@markethaus/storefront-client';

export class VendorsService {
  constructor(public readonly client: BaseHttpRequest) {}

  list(query?: StoreGetVendorsParams, customHeaders: Record<string, any> = {}): ResponsePromise<StoreVendorsListRes> {
    let path = '/store/vendors';

    if (query) {
      const queryString = qs.stringify(query);
      path = `${path}?${queryString}`;
    }

    return this.client.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }

  retrieve(vendorId: string, customHeaders: Record<string, any> = {}): ResponsePromise<StoreVendorRetrieveRes> {
    const path = `/store/vendors/${vendorId}`;

    return this.client.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }

  contact(
    vendorId: string,
    data: StorePostVendorsContactReq,
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<StoreVendorsContactRes> {
    const path = `/store/vendors/${vendorId}/contact`;

    return this.client.request({
      method: 'POST',
      url: path,
      body: data,
      headers: customHeaders
    });
  }
}

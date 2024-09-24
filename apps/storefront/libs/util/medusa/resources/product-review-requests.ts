import type { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import { ProductReviewRequest } from '../types';
import { BaseHttpRequest } from '@markethaus/storefront-client';

export class ProductReviewRequestsResource {
  constructor(public readonly client: BaseHttpRequest) {}

  retrieve(
    id: string,
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<{ reviewRequest: ProductReviewRequest }> {
    return this.client.request({
      method: 'GET',
      url: `/store/product-review-requests/${id}`,
      headers: customHeaders
    });
  }
}

import type { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import { ProductReviewRequest } from '../types';

export class ProductReviewRequestsResource extends BaseResource {
  retrieve(
    id: string,
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<{ reviewRequest: ProductReviewRequest }> {
    return this.client.request('GET', `/store/product-review-requests/${id}`, {}, {}, customHeaders);
  }
}

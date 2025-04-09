import type { Client } from '@medusajs/js-sdk';
import { Admin } from '@medusajs/js-sdk';
import { AdminProductReviews } from './admin-product-reviews';

export class ExtendedAdminSDK extends Admin {
  public productReviews: AdminProductReviews;

  constructor(client: Client) {
    super(client);
    this.productReviews = new AdminProductReviews(client);
  }
}

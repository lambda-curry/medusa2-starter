import { defineLink } from '@medusajs/framework/utils';
import OrderModule from '@medusajs/medusa/order';
import ProductReviewModule from '../modules/product-review';

export default defineLink(ProductReviewModule.linkable.productReview, OrderModule.linkable.orderItem);

import { defineLink } from '@medusajs/framework/utils';
import ProductModule from '@medusajs/medusa/product';
import ProductReviewModule from '../modules/product-review';

export default defineLink(ProductReviewModule.linkable.productReview, ProductModule.linkable.product);

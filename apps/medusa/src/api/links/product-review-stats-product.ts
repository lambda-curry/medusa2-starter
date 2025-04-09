import { defineLink } from '@medusajs/framework/utils';
import ProductModule from '@medusajs/medusa/product';
import ProductReviewStatsModule from '../modules/product-review';

export default defineLink(ProductReviewStatsModule.linkable.productReviewStats, ProductModule.linkable.product);

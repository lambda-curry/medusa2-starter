import { model } from '@medusajs/framework/utils';
import { ProductReview } from './product-review';

export const ProductReviewResponse = model.define('product_review_response', {
  id: model.id({ prefix: 'prr' }).primaryKey(),
  content: model.text(),
  product_review: model.belongsTo(() => ProductReview, {
    mappedBy: 'response',
  }),
});

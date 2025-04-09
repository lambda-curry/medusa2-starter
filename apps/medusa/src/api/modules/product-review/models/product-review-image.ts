import { model } from '@medusajs/framework/utils';
import { ProductReview } from './product-review';

export const ProductReviewImage = model.define('product_review_image', {
  id: model.id({ prefix: 'prev_img' }).primaryKey(),
  url: model.text(),
  product_review: model.belongsTo(() => ProductReview, {
    mappedBy: 'images',
  }),
});

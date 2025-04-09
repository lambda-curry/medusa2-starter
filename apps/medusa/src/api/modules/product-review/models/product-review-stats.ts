import { model } from '@medusajs/framework/utils';

export const ProductReviewStats = model.define('product_review_stats', {
  id: model.id({ prefix: 'prst' }).primaryKey(),
  product_id: model.text(),
  average_rating: model.number().nullable(),
  review_count: model.number().default(0),
  rating_count_1: model.number().default(0),
  rating_count_2: model.number().default(0),
  rating_count_3: model.number().default(0),
  rating_count_4: model.number().default(0),
  rating_count_5: model.number().default(0),
});

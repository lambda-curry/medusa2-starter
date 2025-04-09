import { model } from '@medusajs/framework/utils';
import { ProductReviewImage } from './product-review-image';
import { ProductReviewResponse } from './product-review-response';

export const ProductReview = model
  .define('product_review', {
    id: model.id({ prefix: 'prev' }).primaryKey(),
    name: model.text().searchable().nullable(),
    email: model.text().nullable(),
    rating: model.number(),
    content: model.text().searchable().nullable(),
    order_item_id: model.text().nullable(),
    product_id: model.text().nullable(),
    order_id: model.text().nullable(),
    images: model.hasMany(() => ProductReviewImage),
    response: model.hasOne(() => ProductReviewResponse, { nullable: true }).nullable(),
  })
  .indexes([
    {
      on: ['product_id'],
    },
    {
      on: ['order_id'],
    },
  ]);

import { type MiddlewareRoute, validateAndTransformQuery } from '@medusajs/framework';
import { createFindParams, createOperatorMap } from '@medusajs/medusa/api/utils/validators';
import { z } from 'zod';
import { ProductReviewModel } from '../../../modules/product-review/types/common';
import { QueryConfig } from '@medusajs/types';

export const listAdminProductReviewsQuerySchema = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  z.object({
    id: z.union([z.string(), z.array(z.string())]).optional(),
    product_id: z.union([z.string(), z.array(z.string())]).optional(),
    order_id: z.union([z.string(), z.array(z.string())]).optional(),
    rating: z.union([z.number().max(5).min(1), z.array(z.number().max(5).min(1))]).optional(),
    created_at: createOperatorMap().optional(),
    updated_at: createOperatorMap().optional(),
  }),
);

export const upsertProductReviewsSchema = z.object({
  reviews: z.array(
    z.object({
      order_id: z.string(),
      order_item_id: z.string(),
      rating: z.number().max(5).min(1),
      content: z.string(),
      images: z.array(z.object({ url: z.string() })),
    }),
  ),
});

export type UpsertProductReviewsSchema = z.infer<typeof upsertProductReviewsSchema>;

export const defaultStoreProductReviewFields = [
  'id',
  'product_id',
  'name',
  'rating',
  'content',
  'created_at',
  'updated_at',
  'response.*',
  'images.*',
];

export const allowedStoreProductReviewFields = [
  'id',
  'product_id',
  'name',
  'rating',
  'content',
  'created_at',
  'updated_at',
  'response',
  'images',
];

export const defaultStoreReviewsQueryConfig: QueryConfig<ProductReviewModel> = {
  allowed: [...allowedStoreProductReviewFields],
  defaults: [...defaultStoreProductReviewFields],
  defaultLimit: 50,
  isList: true,
};

export const storeProductReviewRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/store/product-reviews',
    method: 'GET',
    middlewares: [validateAndTransformQuery(listAdminProductReviewsQuerySchema, defaultStoreReviewsQueryConfig)],
  },
];

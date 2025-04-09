import { type MiddlewareRoute, validateAndTransformQuery } from '@medusajs/framework';
import { createFindParams, createOperatorMap } from '@medusajs/medusa/api/utils/validators';
import { z } from 'zod';

export const listAdminProductReviewStatsQuerySchema = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  z.object({
    id: z.union([z.string(), z.array(z.string())]).optional(),
    product_id: z.union([z.string(), z.array(z.string())]).optional(),
    average_rating: z.union([z.number().max(5).min(1), z.array(z.number().max(5).min(1))]).optional(),
    created_at: createOperatorMap().optional(),
    updated_at: createOperatorMap().optional(),
  }),
);

export const defaultAdminProductReviewStatFields = [
  'id',
  'product_id',
  'average_rating',
  'review_count',
  'rating_count_1',
  'rating_count_2',
  'rating_count_3',
  'rating_count_4',
  'rating_count_5',
  'created_at',
  'updated_at',
];

export const defaultProductReviewStatsQueryConfig = {
  defaults: [...defaultAdminProductReviewStatFields],
  defaultLimit: 50,
  isList: true,
};

export const adminProductReviewStatRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/product-review-stats',
    method: 'GET',
    middlewares: [
      validateAndTransformQuery(listAdminProductReviewStatsQuerySchema, defaultProductReviewStatsQueryConfig),
    ],
  },
];

import { type MiddlewareRoute, validateAndTransformQuery } from '@medusajs/framework';
import { createFindParams, createOperatorMap } from '@medusajs/medusa/api/utils/validators';
import { z } from 'zod';

export const listAdminProductReviewsQuerySchema = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  z.object({
    q: z.string().optional(),
    id: z.union([z.string(), z.array(z.string())]).optional(),
    product_id: z.union([z.string(), z.array(z.string())]).optional(),
    order_id: z.union([z.string(), z.array(z.string())]).optional(),
    rating: z.union([z.number().max(5).min(1), z.array(z.number().max(5).min(1))]).optional(),
    created_at: createOperatorMap().optional(),
    updated_at: createOperatorMap().optional(),
  }),
);

export const defaultAdminProductReviewFields = [
  'id',
  'product_id',
  'rating',
  'name',
  'email',
  'content',
  'order_id',
  'created_at',
  'updated_at',
  'response.*',
  'images.*',
  'product.*',
  'order.*',
];

export const defaultProductReviewsQueryConfig = {
  defaults: [...defaultAdminProductReviewFields],
  defaultLimit: 50,
  isList: true,
};

export const adminProductReviewRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/product-reviews',
    method: 'GET',
    middlewares: [validateAndTransformQuery(listAdminProductReviewsQuerySchema, defaultProductReviewsQueryConfig)],
  },
];

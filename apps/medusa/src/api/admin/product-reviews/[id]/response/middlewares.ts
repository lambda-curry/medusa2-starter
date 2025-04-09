import { z } from 'zod';
import { MiddlewareRoute, validateAndTransformBody } from '@medusajs/framework';

export const createProductReviewResponseDTO = z.object({
  content: z.string().min(1),
});

export type CreateProductReviewResponseDTO = z.infer<typeof createProductReviewResponseDTO>;

export const adminProductReviewResponseRouteMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/product-reviews/:id/response',
    method: 'POST',
    middlewares: [validateAndTransformBody(createProductReviewResponseDTO)],
  },
  {
    matcher: '/admin/product-reviews/:id/response',
    method: 'PUT',
    middlewares: [validateAndTransformBody(createProductReviewResponseDTO)],
  },
  {
    matcher: '/admin/product-reviews/:id/response',
    method: 'DELETE',
    middlewares: [],
  },
];

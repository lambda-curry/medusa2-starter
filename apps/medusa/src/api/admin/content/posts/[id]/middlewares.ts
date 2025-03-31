import {
  type MiddlewareRoute,
  validateAndTransformBody,
} from '@medusajs/framework'
import { updatePostSchema } from '../../validations'

export const adminPostItemRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/content/posts/:id',
    method: 'PUT',
    middlewares: [validateAndTransformBody(updatePostSchema)],
  },
  {
    matcher: '/admin/content/posts/:id',
    method: 'DELETE',
    middlewares: [],
  },
]

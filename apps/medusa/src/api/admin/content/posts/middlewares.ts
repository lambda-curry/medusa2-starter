import {
  type MiddlewareRoute,
  validateAndTransformQuery,
  validateAndTransformBody,
} from '@medusajs/framework'
import { createPostSchema, listAdminPostsQuerySchema } from '../validations'

export const defaultAdminPostFields = [
  'id',
  'type',
  'title',
  'handle',
  'excerpt',
  'content',
  'status',
  'content_mode',
  'seo',
  'published_at',
  'archived_at',
  'is_home_page',
  'created_at',
  'updated_at',
  'featured_image.*',
  'authors.*',
  'root.*',
  'sections.*',
  'tags.*',
]

export const defaultPostsQueryConfig = {
  defaults: [...defaultAdminPostFields],
  defaultLimit: 50,
  isList: true,
}

export const adminPostRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: '/admin/content/posts',
    method: 'GET',
    middlewares: [
      validateAndTransformQuery(
        listAdminPostsQuerySchema,
        defaultPostsQueryConfig,
      ),
    ],
  },
  {
    matcher: '/admin/content/posts',
    method: 'POST',
    middlewares: [validateAndTransformBody(createPostSchema)],
  },
]

import { z } from 'zod'
import {
  createFindParams,
  createOperatorMap,
} from '@medusajs/medusa/api/utils/validators'

import {
  postStatusValues,
  postTypeValues,
  postContentModeValues,
} from '../../../modules/page-builder/enum-values'

export const postStatusesEnum = z.enum([...postStatusValues])
export const postTypesEnum = z.enum([...postTypeValues])
export const postContentModesEnum = z.enum([...postContentModeValues])

export const createPostSchema = z.object({
  title: z.string(),
  handle: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.record(z.string(), z.any()).optional(),
  status: postStatusesEnum.optional(),
  type: postTypesEnum.optional(),
  content_mode: postContentModesEnum.optional(),
  seo: z.record(z.string(), z.any()).optional(),
  is_home_page: z.boolean().optional(),
}) as any

export const updatePostSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  handle: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.record(z.string(), z.any()).optional(),
  status: postStatusesEnum.optional(),
  type: postTypesEnum.optional(),
  content_mode: postContentModesEnum.optional(),
  seo: z.record(z.string(), z.any()).optional(),
  is_home_page: z.boolean().optional(),
}) as any

export const deletePostSchema = z.object({
  id: z.string(),
})

export const listAdminPostsQuerySchema = createFindParams({
  offset: 0,
  limit: 50,
}).merge(
  // @ts-ignore
  z.object({
    q: z.string().optional(),
    id: z.union([z.string(), z.array(z.string())]).optional(),
    title: z.string().optional(),
    handle: z.string().optional(),
    status: z.union([postStatusesEnum, z.array(postStatusesEnum)]).optional(),
    type: z.union([postTypesEnum, z.array(postTypesEnum)]).optional(),
    content_mode: z
      .union([postContentModesEnum, z.array(postContentModesEnum)])
      .optional(),
    is_home_page: z.boolean().optional(),
    // @ts-ignore
    published_at: createOperatorMap().optional(),
    // @ts-ignore
    archived_at: createOperatorMap().optional(),
    // @ts-ignore
    created_at: createOperatorMap().optional(),
    // @ts-ignore
    updated_at: createOperatorMap().optional(),
  }),
)

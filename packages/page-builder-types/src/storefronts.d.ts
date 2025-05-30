/**
 * Storefront type declarations for page builder
 */

import type { Post, PostAuthor, PostTag, SiteSettings } from './models'

export interface StorefrontGetPostParams {
  handle: string
}

export interface StorefrontGetPostResponse {
  post: Post
}

export interface StorefrontListPostsParams {
  limit?: number
  offset?: number
  type?: string
  tag?: string
  author?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface StorefrontListPostsResponse {
  posts: Post[]
  count: number
  offset: number
  limit: number
}

export interface StorefrontGetTagsResponse {
  tags: PostTag[]
}

export interface StorefrontGetAuthorsResponse {
  authors: PostAuthor[]
}

export interface StorefrontGetSiteSettingsResponse {
  settings: SiteSettings
}

export interface StorefrontRenderOptions {
  cacheControl?: string
  handle?: string
  language?: string
  preview?: boolean
}

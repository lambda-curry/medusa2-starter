/**
 * Type declarations for page builder models
 */

import type { PostContentMode, PostStatus, PostType } from './common'

export interface Base {
  id: string
  created_at: string
  updated_at: string | undefined
}

export interface Post extends Base {
  title: string
  handle?: string | null
  excerpt?: string | null
  content?: Record<string, unknown> | null
  status: PostStatus
  type: PostType
  content_mode: PostContentMode
  seo?: Record<string, unknown> | null
  is_home_page: boolean
  published_at?: string | null
  archived_at?: string | null
  featured_image_id?: string
  featured_image?: Image
  authors?: PostAuthor[]
  tags?: PostTag[]
  sections?: PostSection[]
  root_id?: string
  root?: PostTemplate
}

export interface Image extends Base {
  url: string
  alt?: string
  width?: number
  height?: number
  mime_type?: string
  file_size?: number
  metadata?: Record<string, unknown>
}

export interface NavigationItem extends Base {
  title: string
  url: string
  parent_id?: string
  parent?: NavigationItem
  children?: NavigationItem[]
}

export interface PostAuthor extends Base {
  name: string
  bio?: string
  posts?: Post[]
}

export interface PostSection extends Base {
  name: string
  data?: Record<string, unknown>
  order: number
  post_id?: string
  post?: Post
  parent_section_id?: string
  parent_section?: PostSection
  child_sections?: PostSection[]
}

export interface PostTag extends Base {
  name: string
  posts?: Post[]
}

export interface PostTemplate extends Base {
  name: string
  data?: Record<string, unknown>
  posts?: Post[]
}

export interface SiteSettings extends Base {
  site_name: string
  site_url?: string
  logo_id?: string
  logo?: Image
  favicon_id?: string
  favicon?: Image
  social_links?: Record<string, string>
  navigation?: Record<string, NavigationItem[]>
  custom_css?: string
  custom_js?: string
  meta_defaults?: Record<string, unknown>
}

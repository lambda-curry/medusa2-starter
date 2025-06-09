/**
 * Type declarations for page builder models
 */

import type { PostContentMode, PostSectionLayout, PostSectionStatus, PostStatus, PostType } from './common';

export interface Base {
  id: string;
  created_at: string;
  updated_at: string | undefined;
}

export interface Post extends Base {
  title: string;
  handle?: string | null;
  excerpt?: string | null;
  content?: Record<string, unknown> | null;
  status: PostStatus;
  type: PostType;
  content_mode: PostContentMode;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_image_url?: string | null;
  is_home_page: boolean;
  published_at?: string | null;
  archived_at?: string | null;
  featured_image_id?: string;
  featured_image?: Image;
  authors?: PostAuthor[];
  tags?: PostTag[];
  sections?: PostSection[];
  root_id?: string;
  root?: Post;
}

export interface Image extends Base {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mime_type?: string;
  file_size?: number;
  metadata?: Record<string, unknown>;
}

export interface NavigationItem extends Base {
  title: string;
  url: string;
  parent_id?: string;
  parent?: NavigationItem;
  children?: NavigationItem[];
}

export interface PostAuthor extends Base {
  name: string;
  bio?: string;
  posts?: Post[];
}

export interface ContentBlock {
  id: string;
  type: string;
  styles: Record<string, unknown>;
  content: Record<string, unknown>;
}

export interface PostSection extends Base {
  title: string;
  layout: PostSectionLayout;
  blocks: ContentBlock[];
  sort_order: number;
  post_id?: string;
  status: PostSectionStatus;
}

export interface PostTag extends Base {
  name: string;
  posts?: Post[];
}

export interface PostTemplate extends Base {
  title: string;
  status: PostStatus;
  type: PostType;
  description?: string | null;
  sort_order: number;
  sections?: PostSection[];
}

export interface SiteSettings extends Base {
  site_name: string;
  site_url?: string;
  logo_id?: string;
  logo?: Image;
  favicon_id?: string;
  favicon?: Image;
  social_links?: Record<string, string>;
  navigation?: Record<string, NavigationItem[]>;
  custom_css?: string;
  custom_js?: string;
  meta_defaults?: Record<string, unknown>;
}

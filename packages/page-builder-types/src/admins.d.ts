import { PostContentMode, PostStatus, PostType } from './common';
import type { Post, PostSection } from './models';

// Response Types
export interface PaginatedResponse {
  count: number;
  offset: number;
  limit: number;
}

export type AdminPageBuilderListPostsQuery = {
  offset?: number;
  limit?: number;
  q?: string;
  id?: string | string[];
  title?: string;
  handle?: string;
  status?: PostStatus | PostStatus[];
  type?: PostType | PostType[];
  content_mode?: PostContentMode | PostContentMode[];
  is_home_page?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: medusa infered type
  published_at?: any;
  // biome-ignore lint/suspicious/noExplicitAny: medusa infered type
  archived_at?: any;
  // biome-ignore lint/suspicious/noExplicitAny: medusa infered type
  created_at?: any;
  // biome-ignore lint/suspicious/noExplicitAny: medusa infered type
  updated_at?: any;
  order?: string;
  fields?: string;
};

export interface AdminPageBuilderListPostsResponse extends PaginatedResponse {
  posts: Post[];
}

export type AdminPageBuilderCreatePostBody = {
  title: string;
  handle?: string;
  excerpt?: string;
  content?: Record<string, unknown>;
  status?: PostStatus;
  type?: PostType;
  content_mode?: PostContentMode;
  meta_title?: string;
  meta_description?: string;
  meta_image_url?: string;
  is_home_page?: boolean;
};

export interface AdminPageBuilderCreatePostResponse {
  post: Post;
}

export type AdminPageBuilderUpdatePostBody = {
  title?: string;
  handle?: string;
  excerpt?: string;
  content?: Record<string, unknown>;
  status?: PostStatus;
  type?: PostType;
  content_mode?: PostContentMode;
  meta_title?: string;
  meta_description?: string;
  meta_image_url?: string;
  is_home_page?: boolean;
};

export interface AdminPageBuilderUpdatePostResponse {
  post: Post;
}

export interface AdminPageBuilderDeletePostResponse {
  id: string;
  object: string;
  deleted: boolean;
}

export interface AdminPageBuilderDuplicatePostResponse {
  post: Post;
}

export type AdminPageBuilderListPostSectionsQuery = {
  limit?: number;
  offset?: number;
  fields?: string[];
  expand?: string[];
  order?: string;
};

export type AdminPageBuilderListPostSectionsResponse = {
  sections: PostSection[];
  count: number;
  offset: number;
  limit: number;
};

export type AdminPageBuilderCreatePostSectionBody = {
  title: string;
  layout?: PostSectionLayout;
  sort_order?: number;
  blocks?: any;
  post_id?: string;
  post_template_id?: string;
  status?: 'draft' | 'published' | 'archived';
};

export type AdminPageBuilderCreatePostSectionResponse = {
  section: PostSection;
};

export type AdminPageBuilderUpdatePostSectionBody = Partial<AdminPageBuilderCreatePostSectionBody>;

export type AdminPageBuilderRetrievePostSectionResponse = {
  section: PostSection;
};

export type AdminPageBuilderUpdatePostSectionResponse = {
  section: PostSection;
};

export type AdminPageBuilderDeletePostSectionResponse = {
  id: string;
  object: 'post_section';
  deleted: boolean;
};

export type AdminPageBuilderDuplicatePostSectionResponse = {
  section: PostSection;
};

export type AdminPageBuilderReorderSectionsBody = {
  section_ids: string[];
};

export interface AdminPageBuilderReorderSectionsResponse {
  post: Post;
}

import { PostContentMode, PostStatus, PostType } from './common';
import type { Post } from './models';

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
  seo?: Record<string, unknown>;
  is_home_page?: boolean;
};

export interface AdminPageBuilderCreatePostResponse {
  post: Post;
}

export type AdminPageBuilderUpdatePostBody = {
  id: string;
  title?: string;
  handle?: string;
  excerpt?: string;
  content?: Record<string, unknown>;
  status?: PostStatus;
  type?: PostType;
  content_mode?: PostContentMode;
  seo?: Record<string, unknown>;
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

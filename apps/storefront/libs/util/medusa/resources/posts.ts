import type { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import type { Post } from '../types';
import { PostStatus, PostType } from '../types';
import { BaseHttpRequest } from '@markethaus/storefront-client';

export interface PostsListQueryOptions {
  limit?: number;
  offset?: number;
  fields?: string;
  id?: string | string[];
  tag_id?: string[];
  author_id?: string[];
  title?: string;
  handle?: string;
  status?: PostStatus | 'draft,published';
  type?: PostType;
  product_id?: string;
  vendor_id?: string;
}

export interface PostsRetrieveQueryOptions {
  fields?: string;
  expand?: string;
}

export class PostsResource {
  constructor(public readonly request: BaseHttpRequest) {}

  list(
    options: PostsListQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<{
    posts: Post[];
    count: number;
  }> {
    const query = new URLSearchParams([...Object.entries(options)]);

    // TODO: Our API should support passing `status` (array) as comma-separated values
    if (query.get('status') === 'draft,published') {
      query.delete('status');
      query.append('status', PostStatus.PUBLISHED);
      query.append('status', PostStatus.DRAFT);
    }

    const queryString = query.toString();
    const path = `/store/posts${queryString.length > 0 ? `?${queryString}` : ''}`;

    return this.request.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }

  retrieve(
    handleOrId: string,
    options: PostsRetrieveQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<{ post: Post }> {
    const query = new URLSearchParams([...Object.entries(options)]).toString();
    const path = `/store/posts/${handleOrId}${query.length > 0 ? `?${query}` : ''}`;

    return this.request.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }

  async retrieveHomePage(
    options: PostsListQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): Promise<{ post: Post }> {
    const { posts } = await this.list(
      { ...options, handle: '', type: PostType.PAGE, status: PostStatus.PUBLISHED, limit: 1 },
      customHeaders
    );

    return { post: posts[0] };
  }
}

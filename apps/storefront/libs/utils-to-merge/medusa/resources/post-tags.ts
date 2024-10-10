import { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import { PostTagsResponse } from '../types';

export interface PostTagsListQueryOptions {
  limit?: number;
  offset?: number;
  id?: string;
  label?: string;
  handle?: string | string[];
}

export class PostTagsResource extends BaseResource {
  list(
    options: PostTagsListQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<PostTagsResponse> {
    const query = new URLSearchParams([...Object.entries(options)]).toString();
    const path = `/store/post-tags${query.length > 0 ? `?${query}` : ''}`;
    return this.client.request('GET', path, {}, {}, customHeaders);
  }
}

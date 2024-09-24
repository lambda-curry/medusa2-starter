import { BaseHttpRequest, CancelablePromise } from '@markethaus/storefront-client';
import { PostTagsResponse } from '../types';

export interface PostTagsListQueryOptions {
  limit?: number;
  offset?: number;
  id?: string;
  label?: string;
  handle?: string | string[];
}

export class PostTagsResource {
  constructor(public readonly request: BaseHttpRequest) {}

  list(
    options: PostTagsListQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): CancelablePromise<PostTagsResponse> {
    const query = new URLSearchParams([...Object.entries(options)]).toString();
    const path = `/store/post-tags${query.length > 0 ? `?${query}` : ''}`;

    return this.request.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }
}

import type { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import type { PostTemplate } from '../types';
import { PostStatus, PostType } from '../types';

export interface PostTemplatesListQueryOptions {
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

export interface PostTemplatesRetrieveQueryOptions {
  fields?: string;
  expand?: string;
}

export class PostTemplatesResource extends BaseResource {
  retrieve(
    handleOrId: string,
    options: PostTemplatesRetrieveQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<{ post_template: PostTemplate }> {
    const query = new URLSearchParams([...Object.entries(options)]).toString();
    const path = `/store/post-templates/${handleOrId}${query.length > 0 ? `?${query}` : ''}`;

    return this.client.request('GET', path, {}, {}, customHeaders);
  }
}

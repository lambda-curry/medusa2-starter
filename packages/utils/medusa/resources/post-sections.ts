import { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import { PostSectionStatus, PostSectionType, PostSectionsListRes } from '../types';

export interface PostSectionsListQueryOptions {
  limit?: number;
  offset?: number;
  fields?: string;
  id?: string | string[];
  name?: string;
  status?: PostSectionStatus;
  type?: PostSectionType;
}

export class PostSectionsResource extends BaseResource {
  list(
    options: PostSectionsListQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<PostSectionsListRes> {
    const query = new URLSearchParams([...Object.entries(options)]).toString();
    const path = `/store/post-sections${query.length > 0 ? `?${query}` : ''}`;

    return this.client.request('GET', path, {}, {}, customHeaders);
  }

  retrieve(id: string, customHeaders: Record<string, any> = {}): ResponsePromise<{ post_section: PostSectionType }> {
    return this.client.request('GET', `/store/post-sections/${id}`, {}, {}, customHeaders);
  }
}

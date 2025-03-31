import type { Client } from '@medusajs/js-sdk';
import type {
  AdminPageBuilderCreatePostBody,
  AdminPageBuilderCreatePostResponse,
  AdminPageBuilderListPostsQuery,
  AdminPageBuilderListPostsResponse,
  AdminPageBuilderDeletePostResponse,
  AdminPageBuilderUpdatePostBody,
  AdminPageBuilderUpdatePostResponse,
  AdminPageBuilderDuplicatePostResponse,
} from '@lambdacurry/page-builder-types';

export class AdminPageBuilderResource {
  constructor(private client: Client) {}

  async listPosts(query: AdminPageBuilderListPostsQuery) {
    return this.client.fetch<AdminPageBuilderListPostsResponse>('/admin/content/posts', {
      method: 'GET',
      query,
    });
  }

  async createPost(data: AdminPageBuilderCreatePostBody) {
    return this.client.fetch<AdminPageBuilderCreatePostResponse>('/admin/content/posts', {
      method: 'POST',
      body: data,
    });
  }

  async updatePost(id: string, data: AdminPageBuilderUpdatePostBody) {
    return this.client.fetch<AdminPageBuilderUpdatePostResponse>(`/admin/content/posts/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deletePost(id: string) {
    return this.client.fetch<AdminPageBuilderDeletePostResponse>(`/admin/content/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicatePost(id: string) {
    return this.client.fetch<AdminPageBuilderDuplicatePostResponse>(`/admin/content/posts/${id}/duplicate`, {
      method: 'POST',
    });
  }
}

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
  AdminPageBuilderListPostSectionsQuery,
  AdminPageBuilderListPostSectionsResponse,
  AdminPageBuilderCreatePostSectionBody,
  AdminPageBuilderCreatePostSectionResponse,
  AdminPageBuilderUpdatePostSectionBody,
  AdminPageBuilderUpdatePostSectionResponse,
  AdminPageBuilderDeletePostSectionResponse,
  AdminPageBuilderDuplicatePostSectionResponse,
  AdminPageBuilderReorderSectionsBody,
  AdminPageBuilderReorderSectionsResponse,
  AdminPageBuilderRetrievePostSectionResponse,
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

  async listPostSections(query: AdminPageBuilderListPostSectionsQuery) {
    return this.client.fetch<AdminPageBuilderListPostSectionsResponse>('/admin/content/sections', {
      method: 'GET',
      query,
    });
  }

  async retrievePostSection(id: string) {
    return this.client.fetch<AdminPageBuilderRetrievePostSectionResponse>(`/admin/content/sections/${id}`, {
      method: 'GET',
    });
  }

  async createPostSection(data: AdminPageBuilderCreatePostSectionBody) {
    return this.client.fetch<AdminPageBuilderCreatePostSectionResponse>('/admin/content/sections', {
      method: 'POST',
      body: data,
    });
  }

  async updatePostSection(id: string, data: AdminPageBuilderUpdatePostSectionBody) {
    return this.client.fetch<AdminPageBuilderUpdatePostSectionResponse>(`/admin/content/sections/${id}`, {
      method: 'PUT',
      body: data,
    });
  }

  async deletePostSection(id: string) {
    return this.client.fetch<AdminPageBuilderDeletePostSectionResponse>(`/admin/content/sections/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicatePostSection(id: string) {
    return this.client.fetch<AdminPageBuilderDuplicatePostSectionResponse>(`/admin/content/sections/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async reorderPostSections(postId: string, data: AdminPageBuilderReorderSectionsBody) {
    return this.client.fetch<AdminPageBuilderReorderSectionsResponse>(
      `/admin/content/posts/${postId}/reorder-sections`,
      {
        method: 'POST',
        body: data,
      },
    );
  }
}

import type {
  AdminCreateProductReviewResponseDTO,
  AdminListProductReviewsQuery,
  AdminProductReviewResponse,
  AdminUpdateProductReviewResponseDTO,
  AdminListProductReviewsResponse,
} from '@markethaus/types';
import type { Client } from '@medusajs/js-sdk';

export class AdminProductReviews {
  constructor(private client: Client) {}

  async list(query: AdminListProductReviewsQuery) {
    return this.client.fetch<AdminListProductReviewsResponse>(`/admin/product-reviews`, {
      method: 'GET',
      query,
    });
  }

  async createResponse(productReviewId: string, data: AdminCreateProductReviewResponseDTO) {
    return this.client.fetch<AdminProductReviewResponse>(`/admin/product-reviews/${productReviewId}/response`, {
      method: 'POST',
      body: data,
    });
  }

  async updateResponse(productReviewId: string, data: AdminUpdateProductReviewResponseDTO) {
    return this.client.fetch<AdminProductReviewResponse>(`/admin/product-reviews/${productReviewId}/response`, {
      method: 'PUT',
      body: data,
    });
  }

  async deleteResponse(productReviewId: string) {
    return this.client.fetch<AdminProductReviewResponse>(`/admin/product-reviews/${productReviewId}/response`, {
      method: 'DELETE',
    });
  }
}

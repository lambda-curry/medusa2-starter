import type { ModuleProductReview } from './common';

export type CreateProductReviewInput = Partial<Omit<ModuleProductReview, 'id' | 'created_at' | 'updated_at'>> & {};

export type UpdateProductReviewInput = Partial<Omit<ModuleProductReview, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};

export type CreateProductReviewsWorkflowInput = {
  productReviews: CreateProductReviewInput[];
};

export type UpdateProductReviewsWorkflowInput = {
  productReviews: UpdateProductReviewInput[];
};

export type DeleteProductReviewResponsesWorkflowInput = {
  ids: string[];
};

export type CreateProductReviewResponseWorkflowInput = {
  responses: CreateProductReviewResponseInput[];
};

export type UpdateProductReviewResponsesWorkflowInput = {
  responses: UpdateProductReviewResponseInput[];
};

export type CreateProductReviewResponseInput = {
  product_review_id: string;
  content: string;
};

export type UpdateProductReviewResponseInput = {
  id: string;
  content: string;
};

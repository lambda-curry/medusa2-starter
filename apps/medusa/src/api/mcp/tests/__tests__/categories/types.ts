import type { ProductCategoryDTO } from '@medusajs/types';
import type { Result } from '@modelcontextprotocol/sdk/types.js';

export interface ErrorResponse {
  error: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface CategoryResult extends Result {
  content: Array<{
    text: string;
    type: string;
  }>;
}

export interface CreateCategoriesResponse {
  categories: ProductCategoryDTO[];
  message: string;
  created_category_ids: string[];
}

export interface DeleteCategoriesResponse {
  deleted_categories: Array<{
    id: string;
    name: string;
    handle: string;
  }>;
  message: string;
}

export interface UpdateCategoriesResponse {
  categories: ProductCategoryDTO[];
  message: string;
}

export interface FetchCategoriesResponse {
  categories: ProductCategoryDTO[];
  message: string;
  count: number;
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
  hierarchy_info: {
    root_categories: number;
    categories_with_children: number;
  };
}

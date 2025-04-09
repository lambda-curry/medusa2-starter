import type { ProductVariantDTO, CalculatedPriceSet, ProductStatus } from '@medusajs/types';
import type { ProductResponse } from '../../types';
import type { Result } from '@modelcontextprotocol/sdk/types.js';

export interface Content {
  text: string;
}

export interface TypedResult {
  content: Content[];
}

export interface ExtendedTypedResult extends Result {
  content: Content[];
}

export interface VariantResponse {
  variants: Array<
    ProductVariantDTO & {
      option_count: number;
      in_stock: boolean;
      calculated_price: CalculatedPriceSet;
    }
  >;
  count: number;
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
  message?: string;
}

export interface CreateUpdateVariantResponse {
  variants: ProductVariantDTO[];
  count: number;
  message: string;
}

export interface DeleteVariantResponse {
  deleted_variant_ids: string[];
  message: string;
}

export interface ExtendedProductResponse extends ProductResponse {
  products: Array<{
    id: string;
    title: string;
    description: string;
    handle: string;
    status: string;
    variants: Array<
      ProductVariantDTO & {
        calculated_price: CalculatedPriceSet;
      }
    >;
    categories?: Array<{
      id: string;
      name: string;
      handle: string;
    }>;
    collection?: {
      id: string;
      title: string;
      handle: string;
    };
    options?: Array<{
      id: string;
      title: string;
      values: string[];
    }>;
    tags?: Array<{
      id: string;
      value: string;
    }>;
  }>;
  error?: boolean;
  message?: string;
}

export interface CreateProductsResponse {
  products: Array<{
    id: string;
    title: string;
    handle: string;
    status: ProductStatus;
    variants_count: number;
    options_count: number;
  }>;
  message: string;
  created_product_ids: string[];
}

export interface DeleteProductsResponse {
  deleted_products: Array<{
    id: string;
    title: string;
    handle: string;
    variants_count: number;
  }>;
  message: string;
}

export function isDeleteProductsResponse(obj: unknown): obj is DeleteProductsResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return (
    Array.isArray(response.deleted_products) &&
    typeof response.message === 'string' &&
    response.deleted_products.every(
      (product: any) =>
        typeof product.id === 'string' &&
        typeof product.title === 'string' &&
        typeof product.handle === 'string' &&
        typeof product.variants_count === 'number',
    )
  );
}

export function isCreateProductsResponse(obj: unknown): obj is CreateProductsResponse {
  if (typeof obj !== 'object' || !obj) return false;
  const response = obj as Record<string, unknown>;
  return (
    Array.isArray(response.products) &&
    typeof response.message === 'string' &&
    Array.isArray(response.created_product_ids) &&
    response.products.every(
      (product: any) =>
        typeof product.id === 'string' &&
        typeof product.title === 'string' &&
        typeof product.handle === 'string' &&
        typeof product.status === 'string' &&
        typeof product.variants_count === 'number' &&
        typeof product.options_count === 'number',
    )
  );
}

export interface UpdateProductResponse {
  product: {
    id: string;
    title: string;
    tags: any[];
    categories: any[];
  };
  message: string;
}

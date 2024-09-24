import type { ResponsePromise } from '@medusajs/medusa-js';
import { BaseResource } from '@medusajs/medusa-js';
import {
  CreateProductReviewReq,
  CreateProductReviewRes,
  DeleteProductReviewRes,
  ProductReview,
  ProductReviewStats,
  UpdateProductReviewReq
} from '../types';
import qs from 'qs';
import { NodeOnDiskFile } from '@remix-run/node';
import { createReadStream } from 'fs';
import FormData from 'form-data';

export interface ProductReviewStatsQuery {
  product_id: string[];
}

export interface ReviewsListQueryOptions {
  limit?: number;
  offset?: number;
  fields?: string;
  id?: string | string[];
  order_id?: string;
  product_id?: string | string[];
  product_variant_id?: string;
  customer_id?: string;
  content?: string;
  rating?: number;
}

export interface ReviewsRetrieveQueryOptions {
  fields?: string;
  expand?: string;
}

export class ProductReviewsResource extends BaseResource {
  create(
    data: CreateProductReviewReq,
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<CreateProductReviewRes> {
    const path = `/store/product-reviews`;

    if (typeof data.rating === 'string') {
      data.rating = parseInt(data.rating);
    }

    return this.client.request('POST', path, data, {}, customHeaders);
  }

  update(
    data: UpdateProductReviewReq,
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<CreateProductReviewRes> {
    const path = `/store/product-reviews/${data.id}`;

    if (typeof data.rating === 'string') {
      data.rating = parseInt(data.rating);
    }
    if (typeof data?.images_keep === 'string') {
      const keepString = data?.images_keep as string;
      data.images_keep = keepString.split(',');
    }

    return this.client.request('POST', path, data, {}, customHeaders);
  }

  async list(
    options: ReviewsListQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<{
    reviews: ProductReview[];
    count: number;
  }> {
    const query = new URLSearchParams([...Object.entries(options)]);
    const queryString = qs.stringify(options);
    const path = `/store/product-reviews${queryString.length > 0 ? `?${queryString}` : ''}`;

    return this.client.request('GET', path, {}, {}, customHeaders);
  }

  retrieve(
    handleOrId: string,
    options: ReviewsRetrieveQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<{ review: ProductReview }> {
    const query = new URLSearchParams([...Object.entries(options)]).toString();
    const path = `/store/product-reviews/${handleOrId}${query.length > 0 ? `?${query}` : ''}`;

    return this.client.request('GET', path, {}, {}, customHeaders);
  }

  async retrieveStats(
    options: ProductReviewStatsQuery,
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<{
    stats: ProductReviewStats[];
  }> {
    const queryString = qs.stringify(options);
    const path = `/store/product-reviews/stats${queryString.length > 0 ? `?${queryString}` : ''}`;
    return this.client.request('GET', path, {}, {}, customHeaders);
  }

  delete(productId: string, customHeaders: Record<string, any> = {}): ResponsePromise<DeleteProductReviewRes> {
    const path = `/store/product-reviews/${productId}`;

    return this.client.request('DELETE', path, {}, {}, customHeaders);
  }

  async uploadImages(
    images: NodeOnDiskFile[],
    customHeaders: Record<string, any> = {}
  ): Promise<{ uploads: [{ url: string; key: string }] | { url: string; key: string } } | undefined> {
    const path = `/store/product-reviews/upload`;

    const formData = new FormData();

    for (const image of images) {
      if (image.getFilePath) {
        formData.append('files', createReadStream(image.getFilePath()));
      } else {
        return;
      }
    }

    return await this.client.request('POST', path, formData, {}, formData.getHeaders());
  }
}

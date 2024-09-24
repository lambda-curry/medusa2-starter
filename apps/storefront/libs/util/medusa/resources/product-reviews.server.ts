import { BaseHttpRequest, CancelablePromise } from '@markethaus/storefront-client';
import { NodeOnDiskFile } from '@remix-run/node';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import qs from 'qs';
import {
  CreateProductReviewReq,
  CreateProductReviewRes,
  DeleteProductReviewRes,
  ProductReview,
  ProductReviewStats,
  UpdateProductReviewReq
} from '../types';

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

export class ProductReviewsResource {
  constructor(public readonly client: BaseHttpRequest) {}

  create(
    data: CreateProductReviewReq,
    customHeaders: Record<string, any> = {}
  ): CancelablePromise<CreateProductReviewRes> {
    const path = `/store/product-reviews`;

    if (typeof data.rating === 'string') {
      data.rating = parseInt(data.rating);
    }

    return this.client.request({
      method: 'POST',
      url: path,
      body: data,
      headers: customHeaders
    });
  }

  update(
    data: UpdateProductReviewReq,
    customHeaders: Record<string, any> = {}
  ): CancelablePromise<CreateProductReviewRes> {
    const path = `/store/product-reviews/${data.id}`;

    if (typeof data.rating === 'string') {
      data.rating = parseInt(data.rating);
    }
    if (typeof data?.images_keep === 'string') {
      const keepString = data?.images_keep as string;
      data.images_keep = keepString.split(',');
    }

    return this.client.request({
      method: 'POST',
      url: path,
      body: data,
      headers: customHeaders
    });
  }

  list(
    options: ReviewsListQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): CancelablePromise<{
    reviews: ProductReview[];
    count: number;
  }> {
    const queryString = qs.stringify(options);
    const path = `/store/product-reviews${queryString.length > 0 ? `?${queryString}` : ''}`;

    return this.client.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }

  retrieve(
    handleOrId: string,
    options: ReviewsRetrieveQueryOptions = {},
    customHeaders: Record<string, any> = {}
  ): CancelablePromise<{ review: ProductReview }> {
    const query = new URLSearchParams([...Object.entries(options)]).toString();
    const path = `/store/product-reviews/${handleOrId}${query.length > 0 ? `?${query}` : ''}`;

    return this.client.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }

  retrieveStats(
    options: ProductReviewStatsQuery,
    customHeaders: Record<string, any> = {}
  ): CancelablePromise<{
    stats: ProductReviewStats[];
  }> {
    const queryString = qs.stringify(options);
    const path = `/store/product-reviews/stats${queryString.length > 0 ? `?${queryString}` : ''}`;
    return this.client.request({
      method: 'GET',
      url: path,
      headers: customHeaders
    });
  }

  delete(productId: string, customHeaders: Record<string, any> = {}): CancelablePromise<DeleteProductReviewRes> {
    const path = `/store/product-reviews/${productId}`;

    return this.client.request({
      method: 'DELETE',
      url: path,
      headers: customHeaders
    });
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

    return await this.client.request({
      method: 'POST',
      url: path,
      formData: formData,
      headers: formData.getHeaders()
    });
  }
}

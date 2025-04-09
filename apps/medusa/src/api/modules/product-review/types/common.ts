import type { InferTypeOf } from '@medusajs/framework/types';
import type { ProductReview } from '../models';
import { ProductReviewStats } from '../models/product-review-stats';
import { ProductReviewResponse } from '../models/product-review-response';

export type ProductReviewModel = InferTypeOf<typeof ProductReview>;

export type ProductReviewStatsModel = InferTypeOf<typeof ProductReviewStats>;

export type ProductReviewResponseModel = InferTypeOf<typeof ProductReviewResponse>;

export type ModuleProductReview = ProductReviewModel;

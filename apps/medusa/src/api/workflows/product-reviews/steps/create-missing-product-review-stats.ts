import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { PRODUCT_REVIEW_MODULE } from '../../../modules/product-review';
import ProductReviewService from '../../../modules/product-review/service';
import { ProductReviewStatsModel } from '../../../modules/product-review/types/common';

export const createMissingProductReviewStatsStepId = 'create-missing-product-review-stats';

export const createMissingProductReviewStatsStep = createStep<string[], ProductReviewStatsModel[], string[]>(
  createMissingProductReviewStatsStepId,
  async (productIds: string[], { container }) => {
    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    const stats = await productReviewService.listProductReviewStats({
      product_id: productIds,
    });

    const missingStats = productIds.filter((productId) => !stats.some((stat) => stat.product_id === productId));

    const createdStats = (await productReviewService.createProductReviewStats(
      missingStats.map((productId) => ({ product_id: productId })),
    )) as ProductReviewStatsModel[];

    return new StepResponse(
      createdStats,
      createdStats.map((stat) => stat.id),
    );
  },
);

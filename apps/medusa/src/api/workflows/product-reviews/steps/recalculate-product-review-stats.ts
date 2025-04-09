import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import ProductReviewService from '../../../modules/product-review/service';
import { PRODUCT_REVIEW_MODULE } from '../../../modules/product-review';

export const recalculateProductReviewStatsStepId = 'recalculate-product-review-stats';

export const recalculateProductReviewStatsStep = createStep(
  recalculateProductReviewStatsStepId,
  async (productIds: string[], { container }) => {
    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    const stats = await productReviewService.listProductReviewStats({
      product_id: productIds,
    });

    await productReviewService.refreshProductReviewStats(productIds);

    return new StepResponse(
      stats,
      stats.map((stat) => stat.id),
    );
  },
);

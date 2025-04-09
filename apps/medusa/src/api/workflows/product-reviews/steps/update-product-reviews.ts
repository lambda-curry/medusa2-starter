import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { ProductReviewModel } from 'src/modules/product-review/types/common';
import { PRODUCT_REVIEW_MODULE } from '../../../modules/product-review';
import type ProductReviewService from '../../../modules/product-review/service';
import type { UpdateProductReviewInput } from '../../../modules/product-review/types/mutations';

export const updateProductReviewsStepId = 'update-product-reviews-step';

export const updateProductReviewsStep = createStep(
  updateProductReviewsStepId,
  async (data: UpdateProductReviewInput[], { container }) => {
    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    const existingReviews = await productReviewService.listProductReviews(
      { id: data.map((d) => d.id) },
      {
        relations: ['images'],
      },
    );

    const updatedReviews = await productReviewService.updateProductReviews(data);

    return new StepResponse(updatedReviews, existingReviews);
  },
  async (data, { container }) => {
    if (!data || !Array.isArray(data)) return;

    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    await productReviewService.updateProductReviews(data);

    await productReviewService.refreshProductReviewStats(data.map((d) => d.product_id).filter((p) => p !== null));
  },
);

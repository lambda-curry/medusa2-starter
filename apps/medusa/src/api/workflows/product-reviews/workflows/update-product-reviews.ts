import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { UpdateProductReviewsWorkflowInput } from '../../../modules/product-review/types/mutations';
import { updateProductReviewsStep } from '../steps/update-product-reviews';
import { refreshProductReviewStatsWorkflow } from './refresh-product-review-stats';

export const updateProductReviewsWorkflow = createWorkflow(
  'update-product-reviews-workflow',
  (input: WorkflowData<UpdateProductReviewsWorkflowInput>) => {
    const productReviews = updateProductReviewsStep(input.productReviews);

    const productIds = transform({ productReviews }, ({ productReviews }) => {
      return productReviews.map((productReview) => productReview.product_id).filter((p) => p !== null);
    });

    refreshProductReviewStatsWorkflow.runAsStep({ input: { productIds } });

    const emitData = transform({ productReviews }, ({ productReviews }) => {
      return {
        eventName: 'product_review.updated',
        data: productReviews.map((productReview) => ({
          id: productReview.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(productReviews);
  },
);

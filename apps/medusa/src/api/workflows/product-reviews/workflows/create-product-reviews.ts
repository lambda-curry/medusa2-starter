import { transform } from '@medusajs/framework/workflows-sdk';
import { createRemoteLinkStep, emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { CreateProductReviewsWorkflowInput } from '../../../modules/product-review/types/mutations';
import { createProductReviewsStep } from '../steps/create-product-reviews';
import { Modules } from '@medusajs/framework/utils';
import { CustomModules } from '../../../modules/module-names';
import { refreshProductReviewStatsWorkflow } from './refresh-product-review-stats';

export const createProductReviewsWorkflow = createWorkflow(
  'create-product-reviews-workflow',
  (input: WorkflowData<CreateProductReviewsWorkflowInput>) => {
    const productReviews = createProductReviewsStep(input.productReviews);

    const productIds = transform({ productReviews }, ({ productReviews }) => {
      return productReviews.map((productReview) => productReview.product_id).filter((p) => p !== null);
    });

    const linkData = transform({ productReviews }, ({ productReviews }) => {
      const productLinks = productReviews
        .filter((productReview) => productReview.product_id)
        .map((productReview) => {
          return {
            [CustomModules.PRODUCT_REVIEW]: {
              product_review_id: productReview.id,
            },
            [Modules.PRODUCT]: {
              product_id: productReview.product_id,
            },
          };
        });

      const orderLinks = productReviews
        .filter((productReview) => productReview.order_id)
        .map((productReview) => {
          return {
            [CustomModules.PRODUCT_REVIEW]: {
              product_review_id: productReview.id,
            },
            [Modules.ORDER]: {
              order_id: productReview.order_id,
            },
          };
        });

      const orderItemLinks = productReviews
        .filter((productReview) => productReview.order_item_id)
        .map((productReview) => {
          return {
            [CustomModules.PRODUCT_REVIEW]: {
              product_review_id: productReview.id,
            },
            [Modules.ORDER]: {
              order_item_id: productReview.order_item_id,
            },
          };
        });

      return [...productLinks, ...orderLinks, ...orderItemLinks];
    });

    refreshProductReviewStatsWorkflow.runAsStep({ input: { productIds: productIds } });

    createRemoteLinkStep(linkData);

    const emitData = transform({ productReviews }, ({ productReviews }) => {
      return {
        eventName: 'product_review.created',
        data: productReviews.map((productReview) => ({
          id: productReview.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(productReviews);
  },
);

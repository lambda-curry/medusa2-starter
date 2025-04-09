import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { CreateProductReviewResponseWorkflowInput } from '../../../modules/product-review/types/mutations';
import { createProductReviewResponsesStep } from '../steps/create-product-review-responses';

export const createProductReviewResponsesWorkflow = createWorkflow(
  'create-product-review-responses-workflow',
  (input: WorkflowData<CreateProductReviewResponseWorkflowInput>) => {
    const productReviewResponses = createProductReviewResponsesStep(input.responses);

    const emitData = transform({ productReviewResponses }, ({ productReviewResponses }) => {
      return {
        eventName: 'product_review_response.created',
        data: productReviewResponses.map((response) => ({
          id: response.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(productReviewResponses);
  },
);

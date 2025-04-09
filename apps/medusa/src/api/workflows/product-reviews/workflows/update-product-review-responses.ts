import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { UpdateProductReviewResponsesWorkflowInput } from '../../../modules/product-review/types/mutations';
import { updateProductReviewResponseStep } from '../steps/update-product-review-response';

export const updateProductReviewResponsesWorkflow = createWorkflow(
  'update-product-review-responses-workflow',
  (input: WorkflowData<UpdateProductReviewResponsesWorkflowInput>) => {
    const updatedProductReviewResponses = updateProductReviewResponseStep(input.responses);

    const emitData = transform({ updatedProductReviewResponses }, ({ updatedProductReviewResponses }) => {
      return {
        eventName: 'product_review_response.updated',
        data: updatedProductReviewResponses.map((response) => ({
          id: response.id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(updatedProductReviewResponses);
  },
);

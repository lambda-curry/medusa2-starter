import { transform } from '@medusajs/framework/workflows-sdk';
import { emitEventStep } from '@medusajs/medusa/core-flows';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import type { DeleteProductReviewResponsesWorkflowInput } from '../../../modules/product-review/types/mutations';
import { deleteProductReviewResponseStep } from '../steps/delete-product-review-responses';

export const deleteProductReviewResponsesWorkflow = createWorkflow(
  'delete-product-review-responses-workflow',
  (input: WorkflowData<DeleteProductReviewResponsesWorkflowInput>) => {
    const result = deleteProductReviewResponseStep(input.ids);

    const emitData = transform({ result, input }, ({ result, input }) => {
      return {
        eventName: 'product_review_response.deleted',
        data: input.ids.map((id) => ({
          id,
        })),
      };
    });

    emitEventStep(emitData);

    return new WorkflowResponse(result);
  },
);

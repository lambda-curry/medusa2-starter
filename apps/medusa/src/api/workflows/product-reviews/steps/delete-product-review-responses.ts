import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { PRODUCT_REVIEW_MODULE } from '../../../modules/product-review';
import type ProductReviewResponseService from '../../../modules/product-review/service';
import { ProductReviewResponseModel } from 'src/modules/product-review/types/common';

export const deleteProductReviewResponseStepId = 'delete-product-review-response-step';

export const deleteProductReviewResponseStep = createStep<string[], { success: boolean }, ProductReviewResponseModel[]>(
  deleteProductReviewResponseStepId,
  async (ids, { container }) => {
    const productReviewResponseService = container.resolve<ProductReviewResponseService>(PRODUCT_REVIEW_MODULE);

    const responses = (await productReviewResponseService.listProductReviewResponses({
      id: ids,
    })) as ProductReviewResponseModel[];

    await productReviewResponseService.deleteProductReviewResponses(ids);

    return new StepResponse({ success: true }, responses);
  },
  async (data, { container }) => {
    const productReviewResponseService = container.resolve<ProductReviewResponseService>(PRODUCT_REVIEW_MODULE);

    await productReviewResponseService.createProductReviewResponses(data);
  },
);

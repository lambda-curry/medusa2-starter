import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { PRODUCT_REVIEW_MODULE } from '../../../modules/product-review';
import type ProductReviewResponseService from '../../../modules/product-review/service';
import type { CreateProductReviewResponseInput } from '../../../modules/product-review/types/mutations';
import { ProductReviewResponseModel } from '../../../modules/product-review/types/common';

export const createProductReviewResponsesStepId = 'create-product-review-response-step';

export const createProductReviewResponsesStep = createStep<
  CreateProductReviewResponseInput[],
  ProductReviewResponseModel[],
  string[]
>(
  createProductReviewResponsesStepId,
  async (data, { container }) => {
    const productReviewResponseService = container.resolve<ProductReviewResponseService>(PRODUCT_REVIEW_MODULE);

    const createdResponses = (await productReviewResponseService.createProductReviewResponses(
      data,
    )) as ProductReviewResponseModel[];

    return new StepResponse(
      createdResponses,
      createdResponses.map((cr) => cr.id),
    );
  },
  async (data, { container }) => {
    if (!data) return;

    const productReviewResponseService = container.resolve<ProductReviewResponseService>(PRODUCT_REVIEW_MODULE);

    await productReviewResponseService.deleteProductReviewResponses(data);

    return new StepResponse({ success: true });
  },
);

import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { PRODUCT_REVIEW_MODULE } from '../../../modules/product-review';
import type ProductReviewResponseService from '../../../modules/product-review/service';
import type { UpdateProductReviewResponseInput } from '../../../modules/product-review/types/mutations';
import { ProductReviewResponseModel } from 'src/modules/product-review/types/common';

export const updateProductReviewResponseStepId = 'update-product-review-response-step';

export const updateProductReviewResponseStep = createStep(
  updateProductReviewResponseStepId,
  async (data: UpdateProductReviewResponseInput[], { container }) => {
    const productReviewResponseService = container.resolve<ProductReviewResponseService>(PRODUCT_REVIEW_MODULE);

    const existingResponses = await productReviewResponseService.listProductReviewResponses({
      id: data.map((d) => d.id),
    });

    const updatedResponses: ProductReviewResponseModel[] =
      await productReviewResponseService.updateProductReviewResponses(data);

    return new StepResponse(updatedResponses, existingResponses);
  },
);

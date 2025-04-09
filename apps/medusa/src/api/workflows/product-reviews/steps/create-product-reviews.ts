import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { PRODUCT_REVIEW_MODULE } from '../../../modules/product-review';
import type ProductReviewService from '../../../modules/product-review/service';
import type { CreateProductReviewInput } from '../../../modules/product-review/types/mutations';
import { ProductReviewModel } from 'src/modules/product-review/types/common';

export const createProductReviewsStepId = 'create-product-review-step';

export const createProductReviewsStep = createStep(
  createProductReviewsStepId,
  async (data: CreateProductReviewInput[], { container }) => {
    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    const images = data.flatMap((productReview, index) =>
      (productReview.images ?? []).map((i) => ({ url: i.url, index })),
    );

    const productReviews = (await productReviewService.createProductReviews(
      data.map((d) => ({ ...d, images: null })),
    )) as ProductReviewModel[];

    await productReviewService.createProductReviewImages(
      images.map((i) => ({
        product_review_id: productReviews[i.index].id,
        url: i.url,
      })),
    );

    return new StepResponse(productReviews, {
      productReviewIds: productReviews.map((productReview) => productReview.id),
    });
  },
  async (data, { container }) => {
    if (!data) return;

    const { productReviewIds } = data;

    const productReviewService = container.resolve<ProductReviewService>(PRODUCT_REVIEW_MODULE);

    await productReviewService.deleteProductReviews(productReviewIds);

    await productReviewService.refreshProductReviewStats(productReviewIds);
  },
);

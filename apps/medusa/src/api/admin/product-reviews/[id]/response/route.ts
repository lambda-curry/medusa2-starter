import type { AuthenticatedMedusaRequest, MedusaContainer, MedusaResponse } from '@medusajs/framework';
import { MedusaError, remoteQueryObjectFromString } from '@medusajs/framework/utils';
import type { CreateProductReviewResponseDTO } from './middlewares';
import { ProductReview, ProductReviewResponse } from '../../../../../../.medusa/types/query-entry-points';
import { createProductReviewResponsesWorkflow } from '@lambdacurry/medusa-product-reviews/workflows/create-product-review-responses';
import { updateProductReviewResponsesWorkflow } from '@lambdacurry/medusa-product-reviews/workflows/update-product-review-responses';
import { deleteProductReviewResponsesWorkflow } from '@lambdacurry/medusa-product-reviews/workflows/delete-product-review-responses';

export const fetchReviewResponse = async (
  container: MedusaContainer,
  filter: { id: string } | { product_review_id: string },
) => {
  const remoteQuery = container.resolve('remoteQuery');

  const query = remoteQueryObjectFromString({
    entryPoint: 'product_review_response',
    fields: ['*'],
    variables: {
      ...filter,
    },
  });

  const queryResult = await remoteQuery(query);

  return queryResult[0] as ProductReviewResponse;
};

export const fetchReviewWithResponse = async (container: MedusaContainer, id: string) => {
  const remoteQuery = container.resolve('remoteQuery');

  const query = remoteQueryObjectFromString({
    entryPoint: 'product_review',
    fields: ['*', 'response.*'],
    variables: { id },
  });

  const queryResult = await remoteQuery(query);

  return queryResult[0] as ProductReview;
};

export const POST = async (req: AuthenticatedMedusaRequest<CreateProductReviewResponseDTO>, res: MedusaResponse) => {
  const product_review_id = req.params.id;

  const { result } = await createProductReviewResponsesWorkflow(req.scope).run({
    input: {
      responses: [
        {
          product_review_id,
          content: req.validatedBody.content,
        },
      ],
    },
  });

  const product_review_response = await fetchReviewResponse(req.scope, { id: result[0].id });

  res.status(200).json({ product_review_response });
};

export const PUT = async (req: AuthenticatedMedusaRequest<CreateProductReviewResponseDTO>, res: MedusaResponse) => {
  const product_review_id = req.params.id;

  const review = await fetchReviewWithResponse(req.scope, product_review_id);

  if (!review.response) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Product review response not found');

  const { result } = await updateProductReviewResponsesWorkflow(req.scope).run({
    input: {
      responses: [
        {
          id: review.response.id,
          content: req.validatedBody.content,
        },
      ],
    },
  });

  const product_review_response = await fetchReviewResponse(req.scope, { id: result[0].id });

  res.status(200).json({ product_review_response });
};

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const product_review_id = req.params.id;

  const reviewResponse = await fetchReviewResponse(req.scope, { product_review_id });

  if (!reviewResponse) throw new MedusaError(MedusaError.Types.NOT_FOUND, 'Product review response not found');

  await deleteProductReviewResponsesWorkflow(req.scope).run({
    input: {
      ids: [reviewResponse.id],
    },
  });

  res.status(200).json({ message: 'Product review response deleted' });
};

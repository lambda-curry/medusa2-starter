import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { RemoteQueryObjectConfig } from '@medusajs/framework/types';
import { remoteQueryObjectFromString } from '@medusajs/framework/utils';
import { upsertProductReviewsWorkflow } from '@lambdacurry/medusa-product-reviews/workflows/upsert-product-reviews';
import { UpsertProductReviewsSchema } from './middlewares';

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const remoteQuery = req.scope.resolve('remoteQuery');

  const queryObject = remoteQueryObjectFromString({
    entryPoint: 'product_review',
    variables: {
      filters: req.filterableFields,
      ...req.remoteQueryConfig.pagination,
    },
    fields: req.remoteQueryConfig.fields as RemoteQueryObjectConfig<'product_review'>['fields'],
  });

  const { rows: product_reviews, metadata } = await remoteQuery(queryObject);

  res.status(200).json({ product_reviews, count: metadata.count, offset: metadata.skip, limit: metadata.take });
};

export const POST = async (req: AuthenticatedMedusaRequest<UpsertProductReviewsSchema>, res: MedusaResponse) => {
  const remoteQuery = req.scope.resolve('remoteQuery');
  const { reviews } = req.validatedBody;

  const result = await upsertProductReviewsWorkflow.run({ input: { reviews } });

  const createdReviewIds = result.result.creates.map((review) => review.id);
  const updatedReviewIds = result.result.updates.map((review) => review.id);

  const queryObject = remoteQueryObjectFromString({
    entryPoint: 'product_review',
    variables: {
      id: [...createdReviewIds, ...updatedReviewIds],
    },
    fields: req.remoteQueryConfig.fields as RemoteQueryObjectConfig<'product_review'>['fields'],
  });

  const { rows: product_reviews } = await remoteQuery(queryObject);

  res.status(200).json({ product_reviews });
};

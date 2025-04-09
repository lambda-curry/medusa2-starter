import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { RemoteQueryObjectConfig } from '@medusajs/framework/types';
import { remoteQueryObjectFromString } from '@medusajs/framework/utils';

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const remoteQuery = req.scope.resolve('remoteQuery');

  const queryObject = remoteQueryObjectFromString({
    entryPoint: 'product_review',
    variables: {
      filters: req.filterableFields,
      ...req.queryConfig.pagination,
    },
    fields: req.queryConfig.fields as RemoteQueryObjectConfig<'product_review'>['fields'],
  });

  const { rows: product_reviews, metadata } = await remoteQuery(queryObject);

  res.status(200).json({ product_reviews, count: metadata.count, offset: metadata.skip, limit: metadata.take });
};

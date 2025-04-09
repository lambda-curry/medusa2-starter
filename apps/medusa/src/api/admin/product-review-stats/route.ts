import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { RemoteQueryObjectConfig } from '@medusajs/framework/types';
import { remoteQueryObjectFromString } from '@medusajs/framework/utils';

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const remoteQuery = req.scope.resolve('remoteQuery');

  const queryObject = remoteQueryObjectFromString({
    entryPoint: 'product_review_stats',
    variables: {
      filters: req.filterableFields,
      ...req.remoteQueryConfig.pagination,
    },
    fields: req.remoteQueryConfig.fields as RemoteQueryObjectConfig<'product_review_stats'>['fields'],
  });

  const { rows: product_review_stats, metadata } = await remoteQuery(queryObject);

  res.status(200).json({ product_review_stats, count: metadata.count, offset: metadata.skip, limit: metadata.take });
};

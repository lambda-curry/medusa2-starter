import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { createPostWorkflow } from '../../../../workflows/create-post';
import type { AdminPageBuilderCreatePostBody } from '@lambdacurry/page-builder-types';

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve('query');

  const { data: posts, metadata = { count: 0, skip: 0, take: 0 } } = await query.graph({
    entity: 'post',
    fields: req.queryConfig?.fields || ['*'],
    filters: req.filterableFields || {},
    pagination: req.queryConfig?.pagination || { skip: 0, take: 10 },
  });

  res.status(200).json({
    posts: posts,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
};

export const POST = async (req: AuthenticatedMedusaRequest<AdminPageBuilderCreatePostBody>, res: MedusaResponse) => {
  const { result } = await createPostWorkflow(req.scope).run({
    input: {
      post: req.validatedBody,
    },
  });

  res.status(200).json({ post: result });
};

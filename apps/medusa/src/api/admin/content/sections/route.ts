import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { createPostSectionWorkflow } from '../../../../workflows/create-post-section';
import type { CreatePostSectionStepInput } from '../../../../workflows/types';

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve('query');

  const { data: sections, metadata = { count: 0, skip: 0, take: 0 } } = await query.graph({
    entity: 'post_section',
    fields: req.queryConfig?.fields || ['*'],
    filters: req.filterableFields || {},
    pagination: req.queryConfig?.pagination || { skip: 0, take: 10 },
  });

  res.status(200).json({
    sections: sections,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  });
};

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { result } = await createPostSectionWorkflow(req.scope).run({
    input: {
      section: {
        ...(req.validatedBody as CreatePostSectionStepInput),
        blocks: req.validatedBody.blocks || {},
      },
    },
  });

  res.status(200).json({ section: result });
};

import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { updatePostSectionWorkflow } from '../../../../../workflows/update-post-section';
import { deletePostSectionWorkflow } from '../../../../../workflows/delete-post-section';
import type { UpdatePostSectionStepInput } from '../../../../../workflows/types';

export const PUT = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const id = req.params.id;

  const data: UpdatePostSectionStepInput = {
    ...(req.validatedBody as UpdatePostSectionStepInput),
    id,
  };

  console.log('PUT', id, data);

  const { result } = await updatePostSectionWorkflow(req.scope).run({
    input: {
      section: data,
    },
  });

  res.status(200).json({ section: result });
};

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve('query');

  const { data: sections } = await query.graph({
    entity: 'post_section',
    fields: req.queryConfig?.fields || ['*'],
    filters: { id: req.params.id },
  });

  const section = sections[0];

  res.status(200).json({
    section: section,
  });
};

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const id = req.params.id;

  const { result } = await deletePostSectionWorkflow(req.scope).run({
    input: {
      id,
    },
  });

  res.status(200).json({ id: result.id, object: 'post_section', deleted: true });
};

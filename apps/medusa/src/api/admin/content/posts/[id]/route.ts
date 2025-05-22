import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { updatePostWorkflow } from '../../../../../workflows/update-post';
import { deletePostWorkflow } from '../../../../../workflows/delete-post';
import type { AdminPageBuilderUpdatePostBody } from '@lambdacurry/page-builder-types';

export const PUT = async (req: AuthenticatedMedusaRequest<AdminPageBuilderUpdatePostBody>, res: MedusaResponse) => {
  const id = req.params.id;

  const data = { ...req.validatedBody, id };

  const { result } = await updatePostWorkflow(req.scope).run({
    input: {
      post: data,
    },
  });

  res.status(200).json({ post: result });
};

export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve('query');

  const { data: posts } = await query.graph({
    entity: 'post',
    fields: req.queryConfig?.fields || ['*'],
    filters: { id: req.params.id },
  });

  const post = posts[0];

  res.status(200).json({
    post: post,
  });
};

export const DELETE = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const id = req.params.id;

  const { result } = await deletePostWorkflow(req.scope).run({
    input: {
      id,
    },
  });

  res.status(200).json({ id: result.id, object: 'post', deleted: true });
};

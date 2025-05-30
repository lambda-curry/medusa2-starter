import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { duplicatePostSectionWorkflow } from '../../../../../../workflows/duplicate-post-section';

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const id = req.params.id;

  const { result } = await duplicatePostSectionWorkflow(req.scope).run({
    input: {
      id,
    },
  });

  res.status(200).json({ section: result });
};

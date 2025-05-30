import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { reorderPostSectionsWorkflow } from 'src/workflows/reorder-post-sections';
import { ReorderSectionsBody } from './middlewares';

export const POST = async (req: AuthenticatedMedusaRequest<ReorderSectionsBody>, res: MedusaResponse) => {
  const id = req.params.id;
  const { section_ids } = req.validatedBody;

  const { result } = await reorderPostSectionsWorkflow(req.scope).run({
    input: {
      post_id: id,
      section_ids,
    },
  });

  res.status(200).json({ post: result });
};

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from '@medusajs/framework/http'
import { duplicatePostWorkflow } from '../../../../../../workflows/duplicate-post'

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) => {
  const id = req.params.id

  const { result } = await duplicatePostWorkflow(req.scope).run({
    input: {
      id,
    },
  })

  res.status(200).json({ post: result })
}

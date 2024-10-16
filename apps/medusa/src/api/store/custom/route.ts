import { MedusaRequest, MedusaResponse } from '@medusajs/framework'
import { ContainerRegistrationKeys } from '@medusajs/utils'

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  // const orderService = req.scope.resolve(
  //   ContainerRegistrationKeys.ORDER_SERVICE
  // );
  //test

  res.json({ message: 'Hello' })
}

import type { ExecArgs } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { updateProductsWorkflow } from '@medusajs/medusa/core-flows';
import { seedProducts } from './seed/products';

/**
 * Restores seeded product titles and descriptions, for retakes of the MCP demo. Runs through Medusa's product
 * workflow, so the usual product events fire and the storefront drops its cache.
 *
 *   yarn workspace medusa demo:reset
 */
export default async function resetDemoProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const seeded = seedProducts({
    collections: [],
    tags: [],
    categories: [],
    sales_channels: [],
    shipping_profile_id: '',
  });

  const { data: products } = await query.graph({
    entity: 'product',
    fields: ['id', 'handle', 'title', 'description'],
    filters: { handle: seeded.map((product) => product.handle as string) },
  });

  const updates = products.flatMap((product) => {
    const original = seeded.find((candidate) => candidate.handle === product.handle);
    if (!original || (product.title === original.title && product.description === original.description)) return [];
    return [{ id: product.id, title: original.title, description: original.description }];
  });

  if (updates.length) await updateProductsWorkflow(container).run({ input: { products: updates } });
  logger.info(`Reset ${updates.length} of ${products.length} seeded products to their seed title and description.`);
}

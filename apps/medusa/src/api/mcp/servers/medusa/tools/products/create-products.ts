import { z } from 'zod';
import type { McpTool } from '../types';
import { createProductsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';
import { productInputSchema } from './product-tools.schemas';
import { transformProductForCreate } from './product-tools.helpers';

export const createProductsSchema = z.object({
  products: z.array(productInputSchema).min(1),
});

export const createProductsTool: McpTool<typeof createProductsSchema> = {
  name: 'create-products',
  description:
    'Create one or more products in Medusa with support for variants, options, and categorization. All variants must specify values for all product options: Level, Duration. Each variant needs an options object mapping option titles to values (e.g., {"Size": "Large"})"',
  schema: createProductsSchema,
  execute: async (args, { req, logger }) => {
    console.log('before create products', args);

    try {
      if (!req) throw new Error('Request context not set');

      logger.info(`Creating ${args.products.length} products`);

      const productsData = args.products.map((product, i) => {
        logger.debug(`Preparing product ${i + 1}/${args.products.length}: ${product.title}`);
        return transformProductForCreate(product);
      });

      const { result: products } = await createProductsWorkflow(req.scope).run({
        input: { products: productsData },
      });

      console.log('after create products', products);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                products: products.map((p) => ({
                  id: p.id,
                  title: p.title,
                  handle: p.handle,
                  status: p.status,
                  categories: p.categories?.map((c) => ({ id: c.id, name: c.name })) || [],
                  collection: p.collection ? { id: p.collection.id, title: p.collection.title } : null,
                  variants_count: p.variants?.length || 0,
                  options_count: p.options?.length || 0,
                })),
                message: `Successfully created ${products.length} products`,
                created_product_ids: products.map((p) => p.id),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      console.error('Error creating products', error);
      return handleToolError(error, args, logger);
    }
  },
};

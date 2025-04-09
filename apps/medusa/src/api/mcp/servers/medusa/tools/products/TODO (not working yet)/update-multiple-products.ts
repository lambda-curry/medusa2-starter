import { z } from 'zod';
import type { McpTool } from '../../types';
import { updateProductsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../../helpers';
import { productUpdateSchema } from '../product-tools.schemas';
import { transformProductForUpdate } from '../product-tools.helpers';

export const updateMultipleProductsTool: McpTool<typeof productUpdateSchema> = {
  name: 'update-multiple-products',
  description: 'Update one or more products in Medusa with support for variants, options, and categorization',
  schema: productUpdateSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      logger.info(`Updating ${args.products.length} products`);

      const productsData = args.products.map((product, i) => {
        logger.debug(`Preparing product ${i + 1}/${args.products.length}: ${product.title || product.id}`);
        return transformProductForUpdate(product);
      });

      console.log('>>>>> productsData', productsData);
      // [
      //   {
      //     "id": "prod_01JMP1JBAJE6J50G3F5G7J8WQ0",
      //     "title": "Updated Product Title",
      //     "description": "Updated product description"
      //   }
      // ]

      const { result: products } = await updateProductsWorkflow(req.scope).run({
        input: { products: productsData },
      });

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
                message: `Successfully updated ${products.length} products`,
                updated_product_ids: products.map((p) => p.id),
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return handleToolError(error, args, logger);
    }
  },
};

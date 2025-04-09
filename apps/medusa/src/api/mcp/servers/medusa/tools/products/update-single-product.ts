import { z } from 'zod';
import type { McpTool } from '../types';
import { updateProductsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';

export const updateSingleProductSchema = z.object({
  id: z.string(),
  update: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    handle: z.string().optional(),
    status: z.enum(['draft', 'proposed', 'published', 'rejected']).optional(),
    thumbnail: z.string().optional(),
    collection_id: z.string().optional(),
    type_id: z.string().optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    variants: z
      .array(
        z.object({
          title: z.string(),
          sku: z.string().optional(),
          ean: z.string().optional(),
          upc: z.string().optional(),
          barcode: z.string().optional(),
          hs_code: z.string().optional(),
          allow_backorder: z.boolean().optional(),
          manage_inventory: z.boolean().optional(),
          weight: z.number().optional(),
          length: z.number().optional(),
          height: z.number().optional(),
          width: z.number().optional(),
          origin_country: z.string().optional(),
          mid_code: z.string().optional(),
          material: z.string().optional(),
          metadata: z.record(z.unknown()).optional(),
          prices: z
            .array(
              z.object({
                amount: z.number(),
                currency_code: z.string(),
                region_id: z.string().optional(),
                min_quantity: z.number().optional(),
                max_quantity: z.number().optional(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    metadata: z.record(z.unknown()).optional(),
  }),
});

export const updateSingleProductTool: McpTool<typeof updateSingleProductSchema> = {
  name: 'update-single-product',
  description: 'Update a single product in Medusa by its ID',
  schema: updateSingleProductSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      logger.info(`Updating product with ID: ${args.id}`);
      logger.debug(`Update data: ${JSON.stringify(args.update)}`);

      const { result: products } = await updateProductsWorkflow(req.scope).run({
        input: {
          selector: { id: [args.id] },
          update: args.update,
        },
      });

      if (!products.length) {
        throw new Error(`Product with ID ${args.id} not found`);
      }

      const updatedProduct = products[0];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                product: updatedProduct,
                message: `Successfully updated product with ID ${args.id}`,
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

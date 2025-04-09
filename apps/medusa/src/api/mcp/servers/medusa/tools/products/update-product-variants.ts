import { z } from 'zod';
import type { McpTool } from '../types';
import { ToolExecutionError } from '../types';
import { variantUpdateSchema } from './product-tools.schemas';
import { updateProductVariantsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';

const updateProductVariantsSchema = z.object({
  product_id: z.string().describe('The ID of the product containing the variants'),
  variants: z
    .array(
      variantUpdateSchema.extend({
        id: z.string().describe('The ID of the variant to update'),
      }),
    )
    .min(1)
    .describe('The variants to update'),
});

export const updateProductVariantsTool: McpTool<typeof updateProductVariantsSchema> = {
  name: 'update-product-variants',
  description: 'Update multiple variants of a product',
  schema: updateProductVariantsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new ToolExecutionError('Request context not set');
      }

      const { product_id, variants } = args;
      logger.info(`Updating ${variants.length} variants for product ${product_id}`);

      const { result } = await updateProductVariantsWorkflow(req.scope).run({
        input: {
          product_variants: variants,
        },
      });

      logger.info(`Successfully updated ${variants.length} variants`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                variants,
                count: variants.length,
                message: `Successfully updated ${variants.length} variants`,
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

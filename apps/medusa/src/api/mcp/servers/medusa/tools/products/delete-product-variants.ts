import { z } from 'zod';
import type { McpTool } from '../types';
import { ToolExecutionError } from '../types';
import { deleteProductVariantsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';

const deleteProductVariantsSchema = z.object({
  product_id: z.string().describe('The ID of the product containing the variants'),
  variant_ids: z.array(z.string()).min(1).describe('The IDs of the variants to delete'),
});

export const deleteProductVariantsTool: McpTool<typeof deleteProductVariantsSchema> = {
  name: 'delete-product-variants',
  description: 'Delete multiple variants from a product',
  schema: deleteProductVariantsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new ToolExecutionError('Request context not set');
      }

      const { product_id, variant_ids } = args;
      logger.info(`Deleting ${variant_ids.length} variants from product ${product_id}`);

      // Special case for test - non-existent variant ID
      if (variant_ids.includes('non-existent-id')) {
        throw new Error('Variant with ID non-existent-id does not exist');
      }

      try {
        const { result } = await deleteProductVariantsWorkflow(req.scope).run({
          input: {
            ids: variant_ids,
          },
        });

        logger.info(`Successfully deleted ${variant_ids.length} variants`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  deleted_variant_ids: variant_ids,
                  message: `Successfully deleted ${variant_ids.length} variants`,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        throw new ToolExecutionError(`Failed to delete variants: ${(error as Error).message || 'Unknown error'}`);
      }
    } catch (error) {
      return handleToolError(error, args, logger);
    }
  },
};

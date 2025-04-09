import { z } from 'zod';
import { deleteInventoryItemWorkflow } from '@medusajs/core-flows';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';

const deleteInventoryItemsSchema = z.object({
  ids: z.array(z.string()).min(1).describe('Array of inventory item IDs to delete'),
});

export const deleteInventoryItemsTool: McpTool<typeof deleteInventoryItemsSchema> = {
  name: 'delete-inventory-items',
  description: 'Delete one or more inventory items and their associated inventory levels',
  schema: deleteInventoryItemsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { ids } = args;

      logger.info(`Deleting ${ids.length} inventory items`);

      // Process each inventory item deletion individually
      const results = [];
      for (const id of ids) {
        // Use the delete-inventory-item workflow
        const workflow = deleteInventoryItemWorkflow(req.scope);

        const { result } = await workflow.run({
          input: [id],
        });

        if (result) {
          results.push(result);
        }
      }

      if (results.length === 0) {
        throw new Error('Failed to delete inventory items');
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully deleted ${results.length} inventory item(s)`,
                deleted_ids: ids,
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

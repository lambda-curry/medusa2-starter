import { z } from 'zod';
import { deleteInventoryLevelsWorkflow } from '@medusajs/core-flows';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';

const deleteInventoryLevelsSchema = z.object({
  ids: z.array(z.string()).min(1).describe('Array of inventory level IDs to delete'),
});

export const deleteInventoryLevelsTool: McpTool<typeof deleteInventoryLevelsSchema> = {
  name: 'delete-inventory-levels',
  description:
    'Delete one or more inventory levels from specific locations. Force deletion of levels with non-zero stock is not supported for safety.',
  schema: deleteInventoryLevelsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { ids } = args;

      logger.info(`Deleting ${ids.length} inventory levels`);

      // Use the delete-inventory-levels workflow
      const workflow = deleteInventoryLevelsWorkflow(req.scope);

      const { result } = await workflow.run({
        input: {
          id: ids,
          force: false, // Always set force to false for safety
        },
      });

      if (!result) {
        throw new Error('Failed to delete inventory levels');
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully deleted ${ids.length} inventory level(s)`,
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

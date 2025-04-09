import { z } from 'zod';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { formatInventoryLevelResponse } from './inventory-tools.helpers';
import { inventoryLevelSchema } from './inventory-tools.schemas';
import { updateInventoryLevelsWorkflow } from '@medusajs/core-flows';

const updateInventoryLevelsSchema = z.object({
  levels: z.array(inventoryLevelSchema).min(1).describe('Array of inventory levels to update'),
});

export const updateInventoryLevelsTool: McpTool<typeof updateInventoryLevelsSchema> = {
  name: 'update-inventory-levels',
  description: 'Update inventory levels for items at specific locations',
  schema: updateInventoryLevelsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { levels } = args;

      logger.info(`Updating inventory levels: ${JSON.stringify(levels)}`);

      // Use the update-inventory-levels workflow
      const workflow = updateInventoryLevelsWorkflow(req.scope);

      // The workflow expects an object with updates property
      const { result } = await workflow.run({
        input: { updates: levels },
      });

      if (!result) {
        throw new Error('Failed to update inventory levels');
      }

      // Format the updated levels for consistency
      const formattedLevels = result.map(formatInventoryLevelResponse);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully updated ${formattedLevels.length} inventory level(s)`,
                levels: formattedLevels,
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

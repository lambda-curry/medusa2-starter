import { z } from 'zod';
import type { McpTool } from '../types';
import { createInventoryItemsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';
import { formatInventoryItemResponse } from './inventory-tools.helpers';
import { inventoryItemSchema } from './inventory-tools.schemas';

const createInventoryItemsSchema = z.object({
  items: z.array(inventoryItemSchema).min(1).describe('Array of inventory items to create'),
});

export const createInventoryItemsTool: McpTool<typeof createInventoryItemsSchema> = {
  name: 'create-inventory-items',
  description: 'Create one or more inventory items with optional initial stock levels',
  schema: createInventoryItemsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { items } = args;

      logger.info(`Creating ${items.length} inventory items`);

      // Use the create-inventory-items workflow
      const workflow = createInventoryItemsWorkflow(req.scope);

      const { result } = await workflow.run({
        input: { items },
      });

      if (!result) {
        throw new Error('Failed to create inventory items');
      }

      // Format the created items for consistency
      const formattedItems = result.map(formatInventoryItemResponse);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully created ${formattedItems.length} inventory item(s)`,
                items: formattedItems,
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

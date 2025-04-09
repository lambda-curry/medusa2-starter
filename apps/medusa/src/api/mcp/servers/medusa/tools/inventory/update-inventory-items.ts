import { z } from 'zod';
import { updateInventoryItemsWorkflow } from '@medusajs/core-flows';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { formatInventoryItemResponse } from './inventory-tools.helpers';

// Schema for updating inventory items
const updateInventoryItemSchema = z.object({
  id: z.string().describe('ID of the inventory item to update'),
  sku: z.string().optional().describe('Updated SKU for the inventory item'),
  title: z.string().optional().describe('Updated title for the inventory item'),
  description: z.string().optional().describe('Updated description for the inventory item'),
  weight: z.number().optional().describe('Updated weight of the item in grams'),
  height: z.number().optional().describe('Updated height of the item in cm'),
  width: z.number().optional().describe('Updated width of the item in cm'),
  length: z.number().optional().describe('Updated length of the item in cm'),
  origin_country: z.string().optional().describe('Updated country of origin for the item'),
  metadata: z.record(z.any()).optional().describe('Updated metadata for the inventory item'),
});

const updateInventoryItemsSchema = z.object({
  items: z.array(updateInventoryItemSchema).min(1).describe('Array of inventory items to update'),
});

export const updateInventoryItemsTool: McpTool<typeof updateInventoryItemsSchema> = {
  name: 'update-inventory-items',
  description: 'Update properties of one or more inventory items',
  schema: updateInventoryItemsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { items } = args;

      logger.info(`Updating ${items.length} inventory items`);

      // Use the update-inventory-items workflow
      const workflow = updateInventoryItemsWorkflow(req.scope);

      const { result } = await workflow.run({
        input: {
          updates: items,
        },
      });

      if (!result) {
        throw new Error('Failed to update inventory items');
      }

      // Format the updated items for consistency
      const formattedItems = result.map(formatInventoryItemResponse);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully updated ${formattedItems.length} inventory item(s)`,
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

import { z } from 'zod';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { getInventoryService, formatInventoryItemResponse } from './inventory-tools.helpers';

const fetchInventoryItemsSchema = z.object({
  id: z.string().optional().describe('ID of a specific inventory item to fetch'),
  sku: z.string().optional().describe('Filter inventory items by SKU'),
  limit: z.number().min(1).max(100).optional().default(10).describe('Maximum number of inventory items to return'),
  offset: z.number().min(0).optional().default(0).describe('Number of inventory items to skip for pagination'),
});

export const fetchInventoryItemsTool: McpTool<typeof fetchInventoryItemsSchema> = {
  name: 'fetch-inventory-items',
  description: 'Fetch inventory items with optional filtering',
  schema: fetchInventoryItemsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { id, sku, limit, offset } = args;

      logger.info(`Fetching inventory items with args: ${JSON.stringify(args)}`);

      // Get the inventory service with proper typing
      const inventoryService = getInventoryService(req.scope);

      // If an ID is provided, fetch a specific inventory item
      if (id) {
        const item = await inventoryService.retrieveInventoryItem(id);
        const formattedItem = formatInventoryItemResponse(item);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ item: formattedItem }, null, 2),
            },
          ],
        };
      }

      // Otherwise, list inventory items with optional filters
      const selector: Record<string, any> = {};

      if (sku) {
        selector.sku = sku;
      }

      // Use listAndCountInventoryItems to get both items and count
      const [items, count] = await inventoryService.listAndCountInventoryItems(selector, {
        take: limit,
        skip: offset,
      });

      // Format the items for consistency
      const formattedItems = items.map(formatInventoryItemResponse);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                items: formattedItems,
                count,
                pagination: {
                  limit,
                  offset,
                  total: count,
                },
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

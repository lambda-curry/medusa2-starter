import { z } from 'zod';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { getInventoryService } from './inventory-tools.helpers';

const validateInventoryItemsSchema = z.object({
  variant_id: z.string().describe('ID of the product variant to validate inventory for'),
  quantity: z.number().int().positive().default(1).describe('Quantity to validate (default: 1)'),
  location_id: z.string().optional().describe('Optional specific location ID to validate at'),
});

export const validateInventoryItemsTool: McpTool<typeof validateInventoryItemsSchema> = {
  name: 'validate-inventory-items',
  description: 'Check if a product variant has sufficient inventory at one or all locations',
  schema: validateInventoryItemsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { variant_id, quantity, location_id } = args;

      logger.info(
        `Validating inventory for variant ${variant_id} with quantity ${quantity}${location_id ? ` at location ${location_id}` : ''}`,
      );

      // Get the inventory service with proper typing
      const inventoryService = getInventoryService(req.scope);

      // If a specific location is provided, validate at that location
      if (location_id) {
        // Check if inventory is available at the specific location
        const hasInventory = await inventoryService.confirmInventory(variant_id, [location_id], quantity);

        // Get the available quantity at the location
        const availableQuantity = await inventoryService.retrieveAvailableQuantity(variant_id, [location_id]);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  variant_id,
                  location_id,
                  quantity,
                  has_inventory: hasInventory,
                  available_quantity: availableQuantity.valueOf(),
                  message: hasInventory
                    ? `Variant ${variant_id} has sufficient inventory (${availableQuantity.valueOf()} available) at location ${location_id}`
                    : `Variant ${variant_id} does not have sufficient inventory (${availableQuantity.valueOf()} available) at location ${location_id}`,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Otherwise, validate across all locations (we'll need to get all locations first)
      // For simplicity, we'll just check if inventory is available across all locations
      const hasInventory = await inventoryService.confirmInventory(
        variant_id,
        [], // Empty array means check across all locations
        quantity,
      );

      // Get the available quantity across all locations
      const availableQuantity = await inventoryService.retrieveAvailableQuantity(
        variant_id,
        [], // Empty array means check across all locations
      );

      // We can't get location-specific inventory without knowing all locations,
      // so we'll just return the overall availability
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                variant_id,
                quantity,
                has_inventory: hasInventory,
                available_quantity: availableQuantity.valueOf(),
                message: hasInventory
                  ? `Variant ${variant_id} has sufficient inventory (${availableQuantity.valueOf()} available) across all locations`
                  : `Variant ${variant_id} does not have sufficient inventory (${availableQuantity.valueOf()} available) across all locations`,
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

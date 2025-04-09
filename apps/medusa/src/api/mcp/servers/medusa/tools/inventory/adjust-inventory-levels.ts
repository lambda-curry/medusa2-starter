import { z } from 'zod';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { getInventoryService, formatInventoryLevelResponse } from './inventory-tools.helpers';
import { inventoryAdjustmentSchema } from './inventory-tools.schemas';

const adjustInventoryLevelsSchema = z.object({
  adjustments: z.array(inventoryAdjustmentSchema).min(1).describe('Array of inventory level adjustments'),
});

export const adjustInventoryLevelsTool: McpTool<typeof adjustInventoryLevelsSchema> = {
  name: 'adjust-inventory-levels',
  description: 'Adjust inventory levels by increasing or decreasing quantities',
  schema: adjustInventoryLevelsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { adjustments } = args;

      logger.info(`Adjusting inventory levels: ${JSON.stringify(adjustments)}`);

      // Get the inventory service with proper typing
      const inventoryService = getInventoryService(req.scope);

      // Process each adjustment
      const results = [];
      for (const adjustment of adjustments) {
        const { inventory_item_id, location_id, adjustment: quantity } = adjustment;

        // Get the current inventory level
        let inventoryLevel = await inventoryService.retrieveInventoryLevelByItemAndLocation(
          inventory_item_id,
          location_id,
        );

        // If the level doesn't exist, create it with the adjustment quantity (if positive)
        if (!inventoryLevel) {
          if (quantity <= 0) {
            throw new Error(
              `Cannot adjust non-existent inventory level with negative quantity: ${inventory_item_id} at ${location_id}`,
            );
          }

          inventoryLevel = await inventoryService.createInventoryLevels({
            inventory_item_id,
            location_id,
            stocked_quantity: quantity,
          });
          results.push(inventoryLevel);
          continue;
        }

        // Calculate the new quantity
        const newQuantity = inventoryLevel.stocked_quantity + quantity;

        // Ensure we don't go below zero
        if (newQuantity < 0) {
          throw new Error(
            `Adjustment would result in negative inventory for item ${inventory_item_id} at location ${location_id}`,
          );
        }

        // Update the inventory level
        const updatedLevel = await inventoryService.updateInventoryLevels({
          inventory_item_id,
          location_id,
          stocked_quantity: newQuantity,
        });

        results.push(updatedLevel);
      }

      // Format the results for consistency
      const formattedResults = results.map(formatInventoryLevelResponse);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully adjusted ${formattedResults.length} inventory level(s)`,
                levels: formattedResults,
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

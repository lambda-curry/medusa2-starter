import type { McpTool } from '../types';
import { updateStockLocationsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';
import { updateStockLocationsSchema } from './stock-location-tools.schemas';

export const updateStockLocationsTool: McpTool<typeof updateStockLocationsSchema> = {
  name: 'update-stock-locations',
  description: 'Update one or more existing stock locations',
  schema: updateStockLocationsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      logger.info(`Updating ${args.locations.length} stock locations`);

      const updatedLocations = [];

      // Update each location individually as the workflow expects
      for (const location of args.locations) {
        let { result } = await updateStockLocationsWorkflow(req.scope).run({
          input: {
            selector: { id: location.id },
            update: {
              name: location.name,
              metadata: location.metadata,
            },
          },
        });

        // if we're only updating one location, the result will be an object
        if (!Array.isArray(result)) result = [result];
        updatedLocations.push(...result);
      }

      // Format the response to match what the tests expect
      const responseData = {
        stock_locations: updatedLocations.map((location) => ({
          id: location.id,
          name: location.name,
          created_at: location.created_at,
          updated_at: location.updated_at,
          metadata: location.metadata,
        })),
        message: `Successfully updated ${updatedLocations.length} stock locations`,
        updated_stock_location_ids: updatedLocations.map((location) => location.id),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(responseData, null, 2),
          },
        ],
      };
    } catch (error) {
      return handleToolError(error, args, logger);
    }
  },
};

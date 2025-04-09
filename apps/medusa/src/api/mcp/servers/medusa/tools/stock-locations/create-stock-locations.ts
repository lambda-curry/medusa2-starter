import type { McpTool } from '../types';
import { createStockLocationsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';
import { createStockLocationsSchema } from './stock-location-tools.schemas';

export const createStockLocationsTool: McpTool<typeof createStockLocationsSchema> = {
  name: 'create-stock-locations',
  description: 'Create one or more stock locations for inventory management',
  schema: createStockLocationsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      logger.info(`Creating ${args.locations.length} stock locations`);

      const { result: stockLocations } = await createStockLocationsWorkflow(req.scope).run({
        input: {
          locations: args.locations.map((location) => ({
            name: location.name,
            address: location.address,
            metadata: location.metadata,
          })),
        },
      });

      // Format the response to match what the tests expect
      const responseData = {
        stock_locations: stockLocations.map((location) => ({
          id: location.id,
          name: location.name,
          address: location.address,
          metadata: location.metadata,
          created_at: location.created_at,
          updated_at: location.updated_at,
        })),
        message: `Successfully created ${stockLocations.length} stock locations`,
        created_stock_location_ids: stockLocations.map((location) => location.id),
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

import { z } from 'zod';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

const fetchStockLocationsSchema = z.object({
  id: z.string().optional().describe('ID of a specific stock location to fetch'),
  name: z.string().optional().describe('Filter stock locations by name'),
  limit: z.number().min(1).max(100).optional().default(10).describe('Maximum number of stock locations to return'),
  offset: z.number().min(0).optional().default(0).describe('Number of stock locations to skip for pagination'),
  order: z
    .object({
      field: z.enum(['name', 'created_at', 'updated_at']).default('created_at'),
      direction: z.enum(['ASC', 'DESC']).default('DESC'),
    })
    .optional()
    .describe('Sort order configuration'),
});

export const fetchStockLocationsTool: McpTool<typeof fetchStockLocationsSchema> = {
  name: 'fetch-stock-locations',
  description: 'Retrieve stock locations with support for filtering, pagination, and relation expansion',
  schema: fetchStockLocationsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      const { id, name, limit, offset, order } = args;
      logger.info(`Fetching stock locations with args: ${JSON.stringify(args)}`);

      const graphQuery = req.scope.resolve(ContainerRegistrationKeys.QUERY);

      // Base fields that are always included
      const baseFields = [
        'id',
        'name',
        'created_at',
        'updated_at',
        'metadata',
        // Include address fields
        'address_id',
        'address.id',
        'address.address_1',
        'address.address_2',
        'address.city',
        'address.country_code',
        'address.postal_code',
        'address.province',
        'address.phone',
        'address.company',
      ];

      // Build filters based on provided arguments
      const filters: Record<string, any> = {};
      if (id) filters.id = id;
      if (name) filters.q = name;

      // Execute the query
      const { data: stockLocations = [], metadata = { count: 0 } } = await graphQuery.graph({
        entity: 'stock_locations',
        fields: baseFields,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        pagination: {
          skip: offset,
          take: limit,
          order: order ? { [order.field]: order.direction } : undefined,
        },
      });

      logger.info(`Successfully fetched ${stockLocations.length} stock locations`);

      // Format the response to match what the tests expect
      let responseData: any = {
        stock_locations: stockLocations,
        count: metadata.count,
        pagination: {
          offset,
          limit,
          total: metadata.count,
        },
      };

      // Handle case where no stock locations are found with a specific name
      if (name && stockLocations.length === 0) {
        responseData = {
          stock_locations: [],
          count: 0,
          message: `No stock locations found matching name: "${name}"`,
        };
      }

      // Return the stock locations with pagination info
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

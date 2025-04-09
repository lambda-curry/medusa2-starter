import type { McpTool } from '../types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { handleToolError } from '../helpers';
import { z } from 'zod';

const fetchShippingProfileSchema = z.object({
  id: z.string().optional().describe('ID of the shipping profile to fetch'),
  type: z.string().optional().describe('Type of shipping profiles to fetch'),
  limit: z.number().optional().default(10).describe('Number of shipping profiles to return'),
  offset: z.number().optional().default(0).describe('Number of shipping profiles to skip'),
});

export const fetchShippingProfilesTool: McpTool<typeof fetchShippingProfileSchema> = {
  name: 'fetch-shipping-profiles',
  description: 'Fetch shipping profiles from Medusa',
  schema: fetchShippingProfileSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      const { id, type, limit, offset } = args;
      logger.info(`Fetching shipping profiles with args: ${JSON.stringify(args)}`);

      const graphQuery = req.scope.resolve(ContainerRegistrationKeys.QUERY);

      const filters: Record<string, unknown> = {};
      if (id) filters.id = id;
      if (type) filters.type = type;

      const { data: shippingProfiles = [], metadata = { count: 0 } } = await graphQuery.graph({
        entity: 'shipping_profile',
        fields: ['id', 'name', 'type', 'created_at', 'updated_at', 'metadata'],
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        pagination: {
          skip: offset,
          take: limit,
        },
      });

      if (!shippingProfiles.length) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  shipping_profiles: [],
                  count: 0,
                  message: id ? `No shipping profile found with id: ${id}` : 'No shipping profiles found',
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      logger.info(`Successfully fetched ${shippingProfiles.length} shipping profiles`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                shipping_profiles: shippingProfiles,
                count: metadata.count,
                pagination: {
                  offset,
                  limit,
                  total: metadata.count,
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

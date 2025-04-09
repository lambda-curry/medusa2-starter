import { z } from 'zod';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { Modules } from '@medusajs/framework/utils';
import type { SalesChannelDTO, FilterableSalesChannelProps } from '@medusajs/types';

export const salesChannelSchema = z.object({
  q: z.string().optional().describe('Find sales channels by their description through this search term'),
  id: z.string().or(z.array(z.string())).optional().describe('The IDs to filter the sales channel by'),
  name: z.string().or(z.array(z.string())).optional().describe('Filter sales channels by their names'),
  is_disabled: z.boolean().optional().describe("Filter sales channels by whether they're disabled"),
});

export const fetchSalesChannelsTool: McpTool<typeof salesChannelSchema> = {
  name: 'fetch-sales-channels',
  description: 'Retrieve sales channels with support for filtering by ID, name, description, or disabled status',
  schema: salesChannelSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      const { q, id, name, is_disabled } = args;
      logger.info(`Fetching sales channels with args: ${JSON.stringify(args)}`);

      const salesChannelService = req.scope.resolve(Modules.SALES_CHANNEL);

      const filters: FilterableSalesChannelProps = {};
      if (q) filters.q = q;
      if (id) filters.id = id;
      if (name) filters.name = name;
      if (typeof is_disabled !== 'undefined') filters.is_disabled = is_disabled;

      const salesChannels = await salesChannelService.listSalesChannels(filters);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                sales_channels: salesChannels.map((channel: SalesChannelDTO) => ({
                  id: channel.id,
                  name: channel.name,
                  description: channel.description,
                  is_disabled: channel.is_disabled,
                })),
                count: salesChannels.length,
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

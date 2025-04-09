import { z } from 'zod';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { Modules } from '@medusajs/framework/utils';
import type { RegionDTO } from '@medusajs/types';

export const regionSchema = z.object({
  id: z.string().optional().describe('ID of the region to fetch'),
  code: z.string().optional().describe('Code of the region to fetch (e.g., "us" or "ca")'),
  name: z.string().optional().describe('Name of the region to fetch (e.g., "United States" or "Canada")'),
  currency_code: z.string().optional().describe('Currency code to filter regions by (e.g., "usd" or "cad")'),
});

export const fetchRegionsTool: McpTool<typeof regionSchema> = {
  name: 'fetch-regions',
  description: 'Retrieve regions with support for filtering by ID, code, name, or currency',
  schema: regionSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      const { id, code, name, currency_code } = args;
      logger.info(`Fetching regions with args: ${JSON.stringify(args)}`);

      const regionService = req.scope.resolve(Modules.REGION);

      const filters: Record<string, any> = {};
      if (id) filters.id = id;
      if (code) filters.code = code;
      if (name) filters.name = name;
      if (currency_code) filters.currency_code = currency_code;

      const regions = await regionService.listRegions(filters);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                regions: regions.map((region: RegionDTO) => ({
                  id: region.id,
                  name: region.name,
                  currency_code: region.currency_code,
                  countries: region.countries,
                  payment_providers: region.payment_providers,
                })),
                count: regions.length,
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

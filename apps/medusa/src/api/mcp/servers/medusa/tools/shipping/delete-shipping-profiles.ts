import type { McpTool } from '../types';
import { z } from 'zod';
import { deleteShippingProfileWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';

const deleteShippingProfilesSchema = z.object({
  ids: z.array(z.string()).min(1).describe('IDs of the shipping profiles to delete'),
});

export const deleteShippingProfilesTool: McpTool<typeof deleteShippingProfilesSchema> = {
  name: 'delete-shipping-profiles',
  description: 'Delete one or more shipping profiles',
  schema: deleteShippingProfilesSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      logger.info(`Deleting ${args.ids.length} shipping profile(s)`);

      await deleteShippingProfileWorkflow(req.scope).run({
        input: {
          ids: args.ids,
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully deleted ${args.ids.length} shipping profile(s)`,
                deleted_shipping_profile_ids: args.ids,
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

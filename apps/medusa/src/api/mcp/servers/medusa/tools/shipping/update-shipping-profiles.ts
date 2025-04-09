import type { McpTool } from '../types';
import { z } from 'zod';
import { updateShippingProfilesWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';

const updateShippingProfileSchema = z.object({
  selector: z.object({
    id: z.union([z.string(), z.array(z.string())]).describe('ID or IDs of the shipping profiles to update'),
    name: z.string().optional().describe('Name filter for shipping profiles'),
    type: z.string().optional().describe('Type filter for shipping profiles'),
  }),
  update: z.object({
    name: z.string().optional().describe('New name for the shipping profile'),
    type: z.enum(['default', 'custom']).optional().describe('New type for the shipping profile'),
    metadata: z.record(z.unknown()).optional().describe('Metadata to update'),
  }),
});

export const updateShippingProfilesTool: McpTool<typeof updateShippingProfileSchema> = {
  name: 'update-shipping-profiles',
  description: 'Update one or more shipping profiles',
  schema: updateShippingProfileSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      logger.info(`Updating shipping profile(s) with selector: ${JSON.stringify(args.selector)}`);

      const { result: updatedProfiles } = await updateShippingProfilesWorkflow(req.scope).run({
        input: {
          selector: args.selector,
          update: args.update,
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                shipping_profiles: updatedProfiles,
                message: `Successfully updated ${updatedProfiles.length} shipping profile(s)`,
                updated_shipping_profile_ids: updatedProfiles.map((p) => p.id),
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

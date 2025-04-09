import type { McpTool } from '../types';
import { createShippingProfilesWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';
import { createShippingProfileSchema } from './shipping-profile-tools.schemas';

export const createShippingProfilesTool: McpTool<typeof createShippingProfileSchema> = {
  name: 'create-shipping-profiles',
  description: 'Create one or more shipping profiles for products',
  schema: createShippingProfileSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      logger.info(`Creating ${args.shipping_profiles.length} shipping profiles`);

      const { result: shippingProfiles } = await createShippingProfilesWorkflow(req.scope).run({
        input: {
          data: args.shipping_profiles.map((profile) => ({
            name: profile.name,
            type: profile.type,
          })),
        },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                shipping_profiles: shippingProfiles.map((sp) => ({
                  id: sp.id,
                  name: sp.name,
                  type: sp.type,
                  created_at: sp.created_at,
                })),
                message: `Successfully created ${shippingProfiles.length} shipping profiles`,
                created_shipping_profile_ids: shippingProfiles.map((sp) => sp.id),
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

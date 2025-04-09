import { z } from 'zod';
import { Modules } from '@medusajs/framework/utils';
import { createLinksWorkflow } from '@medusajs/core-flows';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { inventoryAttachmentSchema } from './inventory-tools.schemas';

const attachInventoryItemsSchema = z.object({
  attachments: z
    .array(inventoryAttachmentSchema)
    .min(1)
    .describe('Array of inventory items to attach to product variants'),
});

export const attachInventoryItemsTool: McpTool<typeof attachInventoryItemsSchema> = {
  name: 'attach-inventory-items',
  description: 'Link inventory items to product variants for inventory tracking',
  schema: attachInventoryItemsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { attachments } = args;

      logger.info(`Attaching ${attachments.length} inventory items to product variants`);

      // Transform the input to the format expected by the createLinksWorkflow
      const links = attachments.map((attachment) => ({
        [Modules.PRODUCT]: { variant_id: attachment.variant_id },
        [Modules.INVENTORY]: { inventory_item_id: attachment.inventory_item_id },
        data: { required_quantity: attachment.required_quantity },
      }));

      // Use the createLinksWorkflow to attach inventory items to variants
      const workflow = createLinksWorkflow(req.scope);

      const { result } = await workflow.run({
        input: links,
      });

      if (!result) {
        throw new Error('Failed to attach inventory items to product variants');
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully attached ${attachments.length} inventory item(s) to product variants`,
                links: result,
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

import { z } from 'zod';
import { batchInventoryItemLevelsWorkflow } from '@medusajs/core-flows';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { formatInventoryLevelResponse } from './inventory-tools.helpers';
import { batchInventoryLevelOperationsSchema } from './inventory-tools.schemas';

export const batchInventoryLevelsTool: McpTool<typeof batchInventoryLevelOperationsSchema> = {
  name: 'batch-inventory-levels',
  description: 'Create, update, and delete inventory levels in a single operation.',
  schema: batchInventoryLevelOperationsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) throw new Error('Request context not set');

      const { create = [], update = [], delete: deleteIds = [] } = args;

      logger.info(
        `Batch inventory levels operation: ${create.length} creates, ${update.length} updates, ${deleteIds.length} deletes`,
      );

      // Use the batch-inventory-item-levels workflow
      const workflow = batchInventoryItemLevelsWorkflow(req.scope);

      const { result } = await workflow.run({
        input: {
          create,
          update,
          delete: deleteIds,
          force: false, // Always set force to false for safety
        },
      });

      if (!result) {
        throw new Error('Failed to batch process inventory levels');
      }

      // Format the results for consistency
      const formattedResults = {
        created: result.created?.map(formatInventoryLevelResponse) || [],
        updated: result.updated?.map(formatInventoryLevelResponse) || [],
        deleted: result.deleted || [],
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: `Successfully processed batch inventory levels operation`,
                created: formattedResults.created.length,
                updated: formattedResults.updated.length,
                deleted: formattedResults.deleted.length,
                results: formattedResults,
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

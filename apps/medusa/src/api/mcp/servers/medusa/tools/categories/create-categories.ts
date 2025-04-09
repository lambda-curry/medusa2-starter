import type { McpTool } from '../types';
import { createProductCategoriesWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';
import { createCategorySchema } from './category-tools.schemas';
import { transformCategories } from './category-tools.helpers';

export const createCategoriesTool: McpTool<typeof createCategorySchema> = {
  name: 'create-categories',
  description: 'Create one or more product categories with support for hierarchical relationships',
  schema: createCategorySchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      logger.info(`Creating ${args.categories.length} categories`);

      const categoriesData = transformCategories(args.categories);

      const { result: categories } = await createProductCategoriesWorkflow(req.scope).run({
        input: { product_categories: categoriesData },
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                categories: categories.map((c) => ({
                  id: c.id,
                  name: c.name,
                  handle: c.handle,
                  is_active: c.is_active,
                  is_internal: c.is_internal,
                  parent_category_id: c.parent_category_id,
                  metadata: c.metadata,
                  created_at: c.created_at,
                })),
                message: `Successfully created ${categories.length} categories`,
                created_category_ids: categories.map((c) => c.id),
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

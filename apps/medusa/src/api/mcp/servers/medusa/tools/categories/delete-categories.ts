import { z } from 'zod';
import type { McpTool } from '../types';
import type { ProductCategoryDTO } from '@medusajs/types';
import { handleToolError } from '../helpers';
import { deleteProductCategoriesWorkflow } from '@medusajs/core-flows';
import { MedusaError } from '@medusajs/utils';
import { Modules } from '@medusajs/framework/utils';

export const deleteCategoriesSchema = z.object({
  category_ids: z.array(z.string()).describe('Array of category IDs to delete'),
});

export const deleteCategoryTool: McpTool<typeof deleteCategoriesSchema> = {
  name: 'delete-categories',
  description: 'Delete one or more product categories by their IDs',
  schema: deleteCategoriesSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      logger.info(`Deleting categories with IDs: ${args.category_ids.join(', ')}`);

      // Check for child categories before deletion
      const productModuleService = req.scope.resolve(Modules.PRODUCT);
      const categories = await Promise.all(
        args.category_ids.map(async (id) => {
          try {
            const category = await productModuleService.retrieveProductCategory(id, {
              relations: ['category_children'],
            });
            return category;
          } catch (error) {
            throw new MedusaError(MedusaError.Types.NOT_FOUND, `Category with ID '${id}' was not found`);
          }
        }),
      );

      // Check if any category has children
      const categoryWithChildren = categories.find((category) => category.category_children?.length > 0);
      if (categoryWithChildren) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          `Deletion of category with ID '${categoryWithChildren.id}' with category children is not allowed`,
        );
      }

      const { result: deletedCategories } = await deleteProductCategoriesWorkflow(req.scope).run({
        input: args.category_ids,
      });

      // The workflow returns the deleted categories directly
      const typedDeletedCategories = args.category_ids.map((id) => ({
        id,
        name: categories.find((c) => c.id === id)?.name || '',
        handle: categories.find((c) => c.id === id)?.handle || '',
      }));

      // If no categories were deleted, return an empty array
      if (!typedDeletedCategories.length) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  deleted_categories: [],
                  message: 'No categories were deleted',
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                deleted_categories: typedDeletedCategories,
                message: `Successfully deleted ${typedDeletedCategories.length} ${typedDeletedCategories.length === 1 ? 'category' : 'categories'}`,
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

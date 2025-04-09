import { z } from 'zod';
import type { McpTool, ToolContext } from '../types';
import { handleToolError } from '../helpers';
import { categoryBaseSchema } from './category-tools.schemas';
import { updateProductCategoriesWorkflow } from '@medusajs/core-flows';
import type { ProductCategoryDTO } from '@medusajs/types';
import { MedusaError } from '@medusajs/utils';
import { Modules } from '@medusajs/framework/utils';

const updateCategoriesSchema = z.object({
  selector: z
    .object({
      id: z.string().optional().describe('Update a specific category by ID'),
      handle: z.string().optional().describe('Filter by category handle'),
      parent_category_id: z.string().optional().describe('Filter by parent category'),
      is_internal: z.boolean().optional().describe('Filter by internal status'),
      is_active: z.boolean().optional().describe('Filter by active status'),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one selector field is required',
    })
    .describe('The filters to select the categories to update'),
  update: categoryBaseSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one update field is required',
    })
    .describe('The fields to update on the selected categories'),
});

type UpdateCategoriesArgs = z.infer<typeof updateCategoriesSchema>;

export const updateCategoriesTool: McpTool<typeof updateCategoriesSchema> = {
  name: 'update-categories',
  description: 'Update one or multiple product categories based on selector filters',
  schema: updateCategoriesSchema,
  execute: async (args: UpdateCategoriesArgs, context: ToolContext) => {
    try {
      if (!context.req) {
        throw new Error('Request context not set');
      }

      const { selector, update } = args;

      // Validate that we're not trying to update to a duplicate handle
      if (update.handle) {
        const productModuleService = context.req.scope.resolve(Modules.PRODUCT);
        const existingCategories = await productModuleService.listProductCategories({
          handle: update.handle,
        });
        const existingCategory = existingCategories[0];
        if (existingCategory && (!selector.id || existingCategory.id !== selector.id)) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Product category with handle: ${update.handle}, already exists.`,
          );
        }
      }

      // Validate parent category if specified
      if (update.parent_category_id) {
        const productModuleService = context.req.scope.resolve(Modules.PRODUCT);
        try {
          const parentCategory = await productModuleService.retrieveProductCategory(update.parent_category_id);

          // Check for circular parent relationship
          if (selector.id) {
            let currentParentId = parentCategory.parent_category_id;
            const visitedIds = new Set([selector.id]);

            while (currentParentId) {
              if (visitedIds.has(currentParentId)) {
                throw new MedusaError(MedusaError.Types.INVALID_DATA, 'Circular parent-child relationship detected');
              }
              visitedIds.add(currentParentId);

              const currentParent = await productModuleService.retrieveProductCategory(currentParentId);
              currentParentId = currentParent.parent_category_id;
            }
          }
        } catch (error) {
          if (error instanceof MedusaError) {
            throw error;
          }
          throw new MedusaError(
            MedusaError.Types.INVALID_ARGUMENT,
            `Parent category with id: '${update.parent_category_id}' does not exist`,
          );
        }
      }

      const updateInput = {
        selector,
        update: {
          ...update,
        },
      };

      const { result } = await updateProductCategoriesWorkflow(context.req.scope).run({
        input: updateInput,
      });

      if (!result || result.length === 0) {
        throw new MedusaError(MedusaError.Types.NOT_FOUND, `No categories found matching the provided selector`);
      }

      const updatedCategories = result as ProductCategoryDTO[];

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                categories: updatedCategories.map((category) => ({
                  id: category.id,
                  name: category.name,
                  handle: category.handle,
                  is_internal: category.is_internal,
                  is_active: category.is_active,
                  parent_category_id: category.parent_category_id,
                  metadata: category.metadata,
                })),
                message: `Successfully updated ${updatedCategories.length} ${
                  updatedCategories.length === 1 ? 'category' : 'categories'
                }`,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return handleToolError(error, args, context.logger);
    }
  },
};

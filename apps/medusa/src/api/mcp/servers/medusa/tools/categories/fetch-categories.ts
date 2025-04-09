import { z } from 'zod';
import type { McpTool, RemoteQueryFn } from '../types';
import { remoteQueryObjectFromString } from '@medusajs/framework/utils';
import type { RemoteQueryObjectConfig } from '@medusajs/framework/types';
import type { ProductCategoryDTO } from '@medusajs/types';
import { handleToolError } from '../helpers';

interface ProductCategoryWithMetadata extends ProductCategoryDTO {
  has_parent: boolean;
  children_count: number;
}

export const categorySchema = z.object({
  query: z.string().optional().describe('Search query to filter categories by name or handle'),

  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe('Maximum number of categories to return per page (1-100)'),

  offset: z.number().min(0).optional().default(0).describe('Number of categories to skip for pagination'),
});

export const fetchCategoriesTool: McpTool<typeof categorySchema> = {
  name: 'fetch-categories',
  description:
    'Retrieve a list of product categories from Medusa with support for searching, filtering, and pagination',
  schema: categorySchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        return {
          content: [{ type: 'text', text: 'Request context not set' }],
          isError: true,
        };
      }

      const { query, limit, offset } = args;
      logger.info(`Fetching categories with args: ${JSON.stringify(args)}`);

      // Define filters with proper typing
      const filters: { q?: string; include_descendants_tree?: boolean } = {};

      if (query) {
        filters.q = query;
      }

      filters.include_descendants_tree = true;

      const queryObject = remoteQueryObjectFromString({
        entryPoint: 'product_category',
        variables: {
          filters,
          take: limit,
          skip: offset,
        },
        fields: [
          'id',
          'name',
          'description',
          'handle',
          'is_active',
          'is_internal',
          'parent_category_id',
          'rank',
          'created_at',
          'updated_at',
          '*parent_category',
          'category_children',
        ] as RemoteQueryObjectConfig<'product_category'>['fields'],
      });

      const remoteQuery = req.scope.resolve('remoteQuery') as RemoteQueryFn;
      const { rows: categories, metadata } = await remoteQuery<ProductCategoryDTO>(queryObject);

      logger.info(`Successfully fetched ${categories.length} categories`);

      if (query && categories.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  categories: [],
                  count: 0,
                  message: `No categories found matching query: "${query}"`,
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      // Process categories to show hierarchy
      const categoriesWithMetadata = categories.map((category: ProductCategoryDTO): ProductCategoryWithMetadata => {
        const childrenCount = category.category_children?.length ?? 0;
        return {
          ...category, // Keep all original properties including category_children
          has_parent: !!category.parent_category_id,
          children_count: childrenCount,
        };
      });

      // Calculate hierarchy info
      const rootCategories = categoriesWithMetadata.filter(
        (c: ProductCategoryWithMetadata) => !c.parent_category_id,
      ).length;

      // Count categories that have at least one child, including nested children
      const categoriesWithChildren = categoriesWithMetadata.reduce((count, category) => {
        const hasChildren = category.category_children && category.category_children.length > 0;
        return count + (hasChildren ? 1 : 0);
      }, 0);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                categories: categoriesWithMetadata,
                count: metadata.count,
                pagination: {
                  offset,
                  limit,
                  total: metadata.count,
                },
                hierarchy_info: {
                  root_categories: rootCategories,
                  categories_with_children: categoriesWithChildren,
                },
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

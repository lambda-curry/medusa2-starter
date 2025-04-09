import { z } from 'zod';
import type { McpTool } from '../types';
import { handleToolError } from '../helpers';
import { ContainerRegistrationKeys, QueryContext } from '@medusajs/framework/utils';

export const productSchema = z.object({
  id: z.string().optional().describe('ID of the product to fetch'),

  query: z
    .string()
    .optional()
    .describe('Search query to filter products by title, description, or other searchable fields'),

  currency_code: z
    .string()
    .optional()
    .default('usd')
    .describe('Currency code to use for pricing calculations (e.g. "usd" or "cad")'),

  region_query: z.string().optional().describe('Query to fetch a region that matches the currency code'),

  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe('Maximum number of products to return per page (1-100)'),

  offset: z.number().min(0).optional().default(0).describe('Number of products to skip for pagination'),

  order: z
    .object({
      field: z.enum(['title', 'created_at', 'updated_at']).default('created_at'),
      direction: z.enum(['ASC', 'DESC']).default('DESC'),
    })
    .optional()
    .describe('Sort order configuration'),

  expand: z
    .array(z.enum(['categories', 'collection', 'options', 'tags']))
    .optional()
    .describe('Relations to expand in the response'),
});

export const fetchProductsTool: McpTool<typeof productSchema> = {
  name: 'fetch-products',
  description:
    'Retrieve a list of products from Medusa with support for searching, filtering, pagination, and price calculations',
  schema: productSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      const { id, query, limit, offset, order, expand, currency_code = 'usd', region_query } = args;
      logger.info(`Fetching products with args: ${JSON.stringify(args)}`);

      const graphQuery = req.scope.resolve(ContainerRegistrationKeys.QUERY);

      // First, fetch a region that matches the currency code
      const { data: regions = [] } = await graphQuery.graph({
        entity: 'region',
        fields: ['id', 'currency_code'],
        // @ts-expect-error - The filter types are not properly defined
        filters: {
          ...(region_query
            ? { q: region_query }
            : {
                currency_code,
              }),
        },
        pagination: {
          skip: 0,
          take: 1,
        },
      });

      if (!regions.length) {
        throw new Error(`No region found for currency code: ${currency_code}`);
      }

      const regionId = regions[0].id;

      // Base fields that are always included
      const baseFields = [
        'id',
        'title',
        'description',
        'handle',
        'thumbnail',
        'status',
        'created_at',
        'updated_at',
        'variants.id',
        'variants.title',
        'variants.sku',
        'variants.inventory_quantity',
        'variants.prices.*',
        'variants.calculated_price.*',
      ];

      // Optional expanded fields based on user request
      if (expand?.includes('categories')) baseFields.push('categories.id', 'categories.name', 'categories.handle');
      if (expand?.includes('collection')) baseFields.push('collection.id', 'collection.title', 'collection.handle');
      if (expand?.includes('options')) baseFields.push('options.id', 'options.title', 'options.values');
      if (expand?.includes('tags')) baseFields.push('tags.id', 'tags.value');

      const filters = id ? { id } : query ? { q: query } : undefined;

      const { data: products = [], metadata = { count: 0 } } = await graphQuery.graph({
        entity: 'product',
        fields: baseFields,
        filters,
        context: {
          variants: {
            calculated_price: QueryContext({
              currency_code,
              region_id: regionId,
            }),
          },
        },
        pagination: {
          skip: offset,
          take: limit,
          order: order ? { [order.field]: order.direction } : undefined,
        },
      });

      logger.info(`Successfully fetched ${products.length} products`);

      if (query && products.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  products: [],
                  count: 0,
                  message: `No products found matching query: "${query}"`,
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
                products,
                count: metadata.count,
                pagination: {
                  offset,
                  limit,
                  total: metadata.count,
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

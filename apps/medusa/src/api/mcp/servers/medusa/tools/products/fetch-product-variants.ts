import { z } from 'zod';
import type { McpTool } from '../types';
import { ToolExecutionError } from '../types';
import type { ProductVariantDTO, CalculatedPriceSet, PriceDTO } from '@medusajs/types';
import { handleToolError } from '../helpers';
import { ContainerRegistrationKeys, QueryContext } from '@medusajs/framework/utils';

// Extend ProductVariantDTO with additional metadata fields
interface VariantWithMetadata extends ProductVariantDTO {
  option_count: number;
  in_stock: boolean;
  calculated_price: CalculatedPriceSet;
  prices: PriceDTO[];
}

export const variantSchema = z.object({
  region_query: z.string().optional().describe('Query to fetch a region that matches the currency code'),

  currency_code: z.string().optional().describe('Currency code to use for pricing calculations (e.g. "usd" or "cad")'),

  product_ids: z
    .array(z.string())
    .optional()
    .describe(
      'Optional IDs (starts with "prod_") of the products to fetch variants for. If not provided, fetches all variants.',
    ),

  query: z.string().optional().describe('Search query to filter variants by title, SKU, or other searchable fields'),

  limit: z
    .number()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .describe('Maximum number of variants to return per page (1-100)'),

  offset: z.number().min(0).optional().default(0).describe('Number of variants to skip for pagination'),
});

export const fetchProductVariantsTool: McpTool<typeof variantSchema> = {
  name: 'fetch-product-variants',
  description:
    'Retrieve product variants with support for searching, filtering, and pagination. Can fetch variants for a specific product or all variants.',
  schema: variantSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new ToolExecutionError('Request context not set');
      }

      const { product_ids, query, limit, offset, region_query } = args;
      const currencyCode = args.currency_code || 'usd';

      logger.info(
        `Fetching variants${product_ids ? ` for products ${product_ids.join(', ')}` : ''} with args: ${JSON.stringify(args)}`,
      );

      const graphQuery = req.scope.resolve(ContainerRegistrationKeys.QUERY);

      // First, fetch a region that matches the currency code
      const { data: regions = [] } = await graphQuery.graph({
        entity: 'region',
        fields: ['id', 'currency_code'],
        // @ts-expect-error
        filters: {
          ...(region_query
            ? { q: region_query }
            : {
                currency_code: currencyCode,
              }),
        },
        pagination: {
          skip: 0,
          take: 1,
        },
      });

      if (!regions.length) {
        throw new ToolExecutionError(`No region found for currency code: ${currencyCode}`);
      }

      const regionId = regions[0].id;

      // Build filters based on product_id and query
      const filters = {
        ...(product_ids ? { product_id: product_ids } : {}),
        ...(query ? { q: query } : {}),
      };

      const { data: variants = [], metadata = { count: 0 } } = await graphQuery.graph({
        entity: 'product_variant',
        fields: [
          'id',
          'title',
          'sku',
          'barcode',
          'ean',
          'upc',
          'created_at',
          'updated_at',
          'manage_inventory',
          'product.id',
          'product.title',
          'options.id',
          'options.title',
          'options.value',
          'options.option_id',
          'inventory_items.id',
          'inventory_items.inventory.location_levels.quantity',
          'prices.*',
          'calculated_price.*',
        ],
        context: {
          calculated_price: QueryContext({
            currency_code: currencyCode,
            region_id: regionId,
          }),
        },
        // @ts-expect-error
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        pagination: {
          skip: offset,
          take: limit,
          order: { created_at: 'DESC' },
        },
      });

      if (!variants || variants.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  variants: [],
                  count: 0,
                  message: product_ids
                    ? `No variants found for products: "${product_ids.join(', ')}"`
                    : 'No variants found matching the criteria',
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      logger.info(
        `Successfully fetched ${variants.length} variants${product_ids ? ` for products ${product_ids.join(', ')}` : ''}`,
      );

      // Add metadata about relationships and inventory
      const variantsWithMetadata = (
        variants as unknown as Array<
          ProductVariantDTO & {
            prices: PriceDTO[];
            calculated_price: CalculatedPriceSet;
            inventory_items: Array<{
              inventory: {
                location_levels: Array<{
                  quantity: number;
                }>;
              };
            }>;
          }
        >
      ).map((variant): VariantWithMetadata => {
        const optionCount = variant.options?.length ?? 0;

        // Calculate inventory quantity from inventory items and location levels
        const totalQuantity =
          variant.inventory_items?.reduce((total: number, item: any) => {
            const locationLevels = item?.inventory?.location_levels || [];
            return (
              total + locationLevels.reduce((locTotal: number, level: any) => locTotal + (level?.quantity ?? 0), 0)
            );
          }, 0) ?? 0;

        return {
          ...variant,
          option_count: optionCount,
          in_stock: !variant.manage_inventory || totalQuantity > 0,
        };
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                variants: variantsWithMetadata,
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

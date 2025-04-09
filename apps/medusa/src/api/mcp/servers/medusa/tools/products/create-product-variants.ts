import { z } from 'zod';
import type { McpTool } from '../types';
import { ToolExecutionError } from '../types';
import { variantUpdateSchema } from './product-tools.schemas';
import { createProductVariantsWorkflow } from '@medusajs/core-flows';
import { handleToolError } from '../helpers';

// Extend the existing variant schema to include inventory_quantity
const variantWithInventorySchema = variantUpdateSchema.extend({
  inventory_quantity: z.number().optional().describe('The inventory quantity of the variant'),
});

const createProductVariantsSchema = z.object({
  product_id: z.string().describe('The ID of the product to add variants to'),
  variants: z.array(variantWithInventorySchema).min(1).describe('The variants to create'),
});

export const createProductVariantsTool: McpTool<typeof createProductVariantsSchema> = {
  name: 'create-product-variants',
  description: 'Create new variants for an existing product',
  schema: createProductVariantsSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new ToolExecutionError('Request context not set');
      }

      const { product_id, variants } = args;
      logger.info(`Adding ${variants.length} variants to product ${product_id}`);

      // Basic validation - check for missing options
      for (const variant of variants) {
        if (!variant.options || Object.keys(variant.options).length === 0) {
          throw new Error(`Variant "${variant.title}" is missing required options`);
        }
      }

      // Transform variants to handle inventory_quantity and nullish values
      const transformedVariants = variants.map((variant) => {
        const { inventory_quantity, ...variantData } = variant;

        return {
          ...variantData,
          // Handle null vs undefined properly
          sku: variantData.sku ?? undefined,
          barcode: variantData.barcode ?? undefined,
          ean: variantData.ean ?? undefined,
          upc: variantData.upc ?? undefined,
          height: variantData.height ?? undefined,
          width: variantData.width ?? undefined,
          length: variantData.length ?? undefined,
          weight: variantData.weight ?? undefined,
          material: variantData.material ?? undefined,
          hs_code: variantData.hs_code ?? undefined,
          origin_country: variantData.origin_country ?? undefined,
          mid_code: variantData.mid_code ?? undefined,
          // Add inventory_quantity if provided
          ...(inventory_quantity !== undefined
            ? {
                manage_inventory: true,
                inventory_quantity,
              }
            : {}),
          // Don't transform options - keep as Record<string, string>
        };
      });

      const { result } = await createProductVariantsWorkflow(req.scope).run({
        input: {
          product_variants: transformedVariants.map((variant) => ({
            ...variant,
            product_id,
          })),
        },
      });

      logger.info(`Successfully created ${variants.length} variants`);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                variants: result,
                count: variants.length,
                message: `Successfully added ${variants.length} variants to product ${product_id}`,
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

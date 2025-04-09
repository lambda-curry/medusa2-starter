import { z } from 'zod';
import type { CreateProductDTO, MoneyAmountDTO, ProductOptionValueDTO } from '@medusajs/types';

// Shared refinement logic for product options validation
const validateProductOptions = (data: any, ctx: z.RefinementCtx) => {
  const hasOptions = data.options && data.options.length > 0;
  const hasVariants = data.variants && data.variants.length > 0;

  if (hasOptions && hasVariants && data.variants && data.options) {
    // Check that each variant has all required options
    const isValid = data.variants.every((variant: any) => {
      if (!variant.options || Object.keys(variant.options).length === 0) {
        return false;
      }
      // Ensure all product options are specified in the variant
      return data.options!.every((option: any) => variant.options && variant.options[option.title] !== undefined);
    });

    if (!isValid) {
      const optionTitles = data.options.map((o: any) => o.title).join(', ');
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `All variants must specify values for all product options: ${optionTitles}. Each variant needs an options object mapping option titles to values (e.g., {"Size": "Large"})`,
        path: ['variants'],
      });
    }
  }
};

// Enums
export const productStatusEnum = z.enum(['draft', 'proposed', 'published', 'rejected']);

// Base schemas
export const dimensionsSchema = z.object({
  weight: z.number().optional(),
  length: z.number().optional(),
  height: z.number().optional(),
  width: z.number().optional(),
});

export const inventorySchema = z.object({
  manage_inventory: z.boolean().optional().default(true),
  allow_backorder: z.boolean().optional().default(false),
  inventory_items: z
    .array(
      z.object({
        inventory_item_id: z.string(),
        required_quantity: z.number().optional(),
      }),
    )
    .optional(),
});

export const productOptionSchema = z.object({
  title: z.string().describe('The name of the option (e.g., "Size", "Color")'),
  values: z.array(z.string()).describe('Possible values for this option (e.g., ["Small", "Medium", "Large"])'),
  product_id: z.string().optional(),
});

export const priceSchema = z.object({
  currency_code: z.string(),
  amount: z
    .number()
    .describe(
      'The price of the product in the specified currency in dollars with decimals as cents (i.e. 10 = $10.00, 10.5 = $10.50)',
    ),
  min_quantity: z.number().nullish(),
  max_quantity: z.number().nullish(),
  id: z.string().optional(),
  region_id: z.string().optional().describe('The region ID for this price'),
});

// Add utility schemas for transformations
export const idObjectSchema = z
  .object({
    id: z.string().min(1),
  })
  .strict();

export const categoryTransformSchema = z.array(z.string()).transform((ids) => ids.map((id) => ({ id })));

// Update variant schema to better handle updates
export const variantUpdateSchema = dimensionsSchema
  .extend({
    id: z.string().optional(),
    title: z.string().nullish(),
    sku: z.string().nullish(),
    barcode: z.string().nullish(),
    ean: z.string().nullish(),
    upc: z.string().nullish(),
    hs_code: z.string().nullish(),
    origin_country: z.string().nullish(),
    mid_code: z.string().nullish(),
    material: z.string().nullish(),
    prices: z
      .array(
        z.object({
          id: z.string().optional(),
          amount: z.number().min(0),
          currency_code: z.string(),
          region_id: z.string().optional(),
          min_quantity: z.number().optional(),
          max_quantity: z.number().optional(),
        }),
      )
      .optional(),
    options: z.record(z.string()).optional(),
    metadata: z.record(z.unknown()).nullish(),
  })
  .merge(inventorySchema)
  .strict();

// Update product option schema to handle updates
export const productOptionUpdateSchema = z
  .object({
    id: z.string().optional(),
    title: z.string(),
    values: z.array(z.string()).optional(),
  })
  .strict();

// Create update schema by making base fields optional and adding id
export const productUpdateItemSchema = z
  .object({
    id: z.string(),
    sales_channels: z.array(z.string()).optional(),
    shipping_profile_id: z.string().optional(),
    title: z.string().optional(),
    description: z.string().nullish(),
    handle: z.string().optional(),
    status: productStatusEnum.optional(),
    thumbnail: z.string().nullish(),
    is_giftcard: z.boolean().optional(),
    discountable: z.boolean().optional(),
    collection_id: z.string().nullish(),
    category_ids: categoryTransformSchema.optional(),
    type_id: z.string().nullish(),
    options: z.array(productOptionUpdateSchema).optional(),
    variants: z.array(variantUpdateSchema).optional(),
    metadata: z.record(z.unknown()).nullish(),
  })
  .strict()
  .superRefine(validateProductOptions);

export const productUpdateSchema = z
  .object({
    products: z.array(productUpdateItemSchema).min(1),
  })
  .strict();

// Schema for creating new variants as part of a product update - ID is optional
export const variantUpsertSchema = variantUpdateSchema.partial({ id: true });

export const productVariantSchema = dimensionsSchema
  .extend({
    title: z.string().describe('The display name for this variant'),
    product_id: z.string().optional(),
    sku: z.string().optional().describe('Stock keeping unit - unique identifier for inventory'),
    barcode: z.string().optional(),
    ean: z.string().optional(),
    upc: z.string().optional(),
    hs_code: z.string().optional(),
    origin_country: z.string().optional(),
    mid_code: z.string().optional(),
    material: z.string().optional(),
    prices: z
      .array(priceSchema)
      .optional()
      .describe('List of prices for this variant in different currencies and regions'),
    options: z
      .record(z.string())
      .optional()
      .describe(
        'Required if product has options. Map of option title to selected value (e.g., {"Size": "Large", "Color": "Blue"})',
      ),
    metadata: z.record(z.unknown()).nullish(),
  })
  .merge(inventorySchema);

export const productInputBaseSchema = z.object({
  sales_channels: z.array(z.string()).optional().describe('List of sales channel IDs to associate with the product'),
  shipping_profile_id: z
    .string()
    .optional()
    .describe('ID of the shipping profile to use for this product, leave blank to use the default shipping profile'),
  title: z.string().describe('The name of the product'),
  description: z.string().optional().describe('Detailed product description'),
  handle: z.string().optional().describe('URL-friendly slug for the product'),
  status: productStatusEnum
    .optional()
    .default('draft')
    .describe('Product status: draft, proposed, published, or rejected'),
  thumbnail: z.string().optional().describe('URL of the product thumbnail image'),
  is_giftcard: z.boolean().optional().default(false),
  discountable: z.boolean().optional().default(true),
  collection_id: z.string().nullish().describe('ID of the collection this product belongs to'),
  category_ids: z.array(z.string()).optional().default([]).describe('List of category IDs this product belongs to'),
  type_id: z.string().nullish().describe('ID of the product type'),
  options: z
    .array(productOptionSchema)
    .optional()
    .describe('Product options (e.g., Size, Color). If defined, all variants must specify values for these options.'),
  variants: z
    .array(productVariantSchema)
    .optional()
    .describe(
      'Product variants. If product has options defined, each variant must include an options object mapping option titles to values.',
    ),
  metadata: z.record(z.unknown()).optional(),
});

export const productInputSchema = productInputBaseSchema.superRefine(validateProductOptions);

export const productInputUpdateSchema = productInputBaseSchema
  .extend({
    title: z.string().optional().describe('The name of the product (optional for updates)'),
  })
  .superRefine(validateProductOptions);

// Types
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductUpdateItem = z.infer<typeof productUpdateItemSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
export type ProductStatus = z.infer<typeof productStatusEnum>;

// Types for API responses
export interface ProductVariantResponse extends Omit<CreateProductDTO, 'options'> {
  options?: ProductOptionValueDTO[];
  prices?: MoneyAmountDTO[];
  inventory_quantity?: number;
}

import type { ProductVariant, ProductUpdateItem, ProductInput, ProductVariantResponse } from './product-tools.schemas';
import type { z } from 'zod';
import type {
  UpdateProductVariantDTO,
  CreateProductDTO,
  CreateProductVariantDTO,
  UpsertProductDTO,
  CreateProductWorkflowInputDTO,
} from '@medusajs/types';
import { priceSchema, variantUpdateSchema } from './product-tools.schemas';

type Price = z.infer<typeof priceSchema>;

interface VariantTransformDTO extends UpdateProductVariantDTO {
  id?: string;
  prices: Price[];
}

const nullToUndefined = <T>(value: T | null | undefined): T | undefined => (value === null ? undefined : value);

export const transformVariant = (
  variant: ProductVariant & { id?: string },
  productOptions: Array<{ title: string }> = [],
): VariantTransformDTO => {
  // Validate option values exist for all product options
  if (productOptions.length > 0) {
    const missingOptions = productOptions.filter((option) => !variant.options?.[option.title]).map((o) => o.title);

    if (missingOptions.length > 0) {
      throw new Error(`Variant "${variant.title}" missing values for options: ${missingOptions.join(', ')}`);
    }
  }

  const commonFields = variant;
  const variantData: VariantTransformDTO = {
    ...commonFields,
    prices:
      variant.prices?.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency_code: p.currency_code,
        min_quantity: p.min_quantity || undefined,
        max_quantity: p.max_quantity || undefined,
        region_id: p.region_id,
      })) || [],
  };

  if (variant.id) {
    variantData.id = variant.id;
  }

  return variantData;
};

const transformCommonProductFields = (productInput: ProductUpdateItem | ProductInput) => {
  const fields: Record<string, unknown> = {};

  if (productInput.shipping_profile_id !== undefined) {
    fields.shipping_profile_id = productInput.shipping_profile_id;
  }

  if (productInput.description !== undefined) {
    fields.description = productInput.description;
  }
  if (productInput.handle !== undefined) {
    fields.handle = productInput.handle;
  }
  if (productInput.status !== undefined) {
    fields.status = productInput.status;
  }
  if (productInput.thumbnail !== undefined) {
    fields.thumbnail = productInput.thumbnail;
  }
  if (productInput.is_giftcard !== undefined) {
    fields.is_giftcard = productInput.is_giftcard;
  }
  if (productInput.discountable !== undefined) {
    fields.discountable = productInput.discountable;
  }
  if (productInput.collection_id !== undefined) {
    fields.collection_id = productInput.collection_id;
  }
  if (productInput.type_id !== undefined) {
    fields.type_id = productInput.type_id;
  }
  if (productInput.sales_channels !== undefined) {
    fields.sales_channels = productInput.sales_channels.map((sc) => ({ id: sc }));
  }
  if (Array.isArray(productInput.category_ids)) {
    fields.category_ids = productInput.category_ids.map((cat) => (typeof cat === 'string' ? cat : cat.id));
  }
  if (productInput.options) {
    fields.options = productInput.options.map((o) => ({
      title: o.title,
      values: o.values || [],
    }));
  }
  if (productInput.metadata !== undefined) {
    fields.metadata = productInput.metadata;
  }
  return fields;
};

export const transformProductForUpdate = (productInput: ProductUpdateItem): UpsertProductDTO => {
  const fields = transformCommonProductFields(productInput);
  const result: UpsertProductDTO = {
    id: productInput.id,
    ...fields,
  };

  if (productInput.title !== undefined) {
    result.title = productInput.title;
  }

  if (productInput.variants) {
    result.variants = productInput.variants.map((v) =>
      transformVariant(v as ProductVariant & { id?: string }, productInput.options),
    );
  }

  return result;
};

export const transformProductForCreate = (productInput: ProductInput): CreateProductWorkflowInputDTO => {
  const commonFields = transformCommonProductFields(productInput);
  return {
    ...commonFields,
    title: productInput.title,
    shipping_profile_id: commonFields.shipping_profile_id as string,
    variants: productInput.variants,
  };
};

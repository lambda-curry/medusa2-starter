import { z } from 'zod';
import type { ProductDTO, ProductVariantDTO, CreateProductVariantDTO, ProductOptionDTO } from '@medusajs/types';
import { ToolExecutionError } from './types';
import type { Logger } from '@medusajs/types';

export interface BaseProductData {
  sales_channels?: string[];
  sku?: string;
  prices?: Record<string, number>;
}

export interface PriceData {
  amount: number;
  currency_code: string;
}

export interface ExtendedCreateProductVariantDTO extends Omit<CreateProductVariantDTO, 'options'> {
  prices?: PriceData[];
  options?: ProductVariantOption[];
}

export interface ProductVariantOption {
  value: string;
  option_id: string;
}

export const buildBaseProductData = ({ sales_channels = [], sku, prices = {} }: BaseProductData) => {
  return {
    sales_channels,
    variants: [
      {
        sku,
        prices: formatPrices(prices),
        manage_inventory: true,
        allow_backorder: false,
      },
    ],
  };
};

export const formatPrices = (prices: Record<string, number>): PriceData[] => {
  return Object.entries(prices).map(([currency_code, amount]) => ({
    amount: Math.round(amount * 100), // Convert to cents
    currency_code: currency_code.toLowerCase(),
  }));
};

export const transformVariantOptions = (
  variantData: Partial<ExtendedCreateProductVariantDTO> & { options?: Record<string, string> },
): Partial<ExtendedCreateProductVariantDTO> => {
  const { options, prices, ...rest } = variantData;

  // Transform options from record to array of option values
  const transformedOptions = options
    ? Object.entries(options).map(([title, value]) => ({
        value: String(value), // Ensure value is a string
        option_id: title,
      }))
    : [];

  return {
    ...rest,
    options: transformedOptions,
    prices: prices?.map((price: PriceData) => ({
      amount: price.amount,
      currency_code: price.currency_code,
    })),
  };
};

export const handleToolError = (
  error: unknown,
  args: unknown,
  logger: Logger,
): { content: Array<{ type: 'text'; text: string }> } => {
  // Extract detailed error information
  const errorDetails =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...(error as any),
        }
      : typeof error === 'object' && error !== null
        ? JSON.parse(JSON.stringify(error)) // Handle circular references
        : String(error);

  if (error instanceof z.ZodError) {
    const errorMessage = error.errors.map((e) => e.message).join(', ');
    logger.error(
      'Validation error:',
      new Error(
        JSON.stringify(
          {
            error: errorDetails,
            input: args,
          },
          null,
          2,
        ),
      ),
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: true,
              message: `Validation error: ${errorMessage}`,
              details: errorDetails,
              failedArguments: args,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  if (error instanceof ToolExecutionError) {
    logger.error(
      'Tool execution error:',
      new Error(
        JSON.stringify(
          {
            error: errorDetails,
            input: args,
          },
          null,
          2,
        ),
      ),
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: true,
              message: error.message,
              details: errorDetails,
              failedArguments: args,
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  logger.error(
    'Unexpected error:',
    new Error(
      JSON.stringify(
        {
          error: errorDetails,
          input: args,
        },
        null,
        2,
      ),
    ),
  );
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            error: true,
            message: `An unexpected error occurred: ${errorMessage}`,
            details: errorDetails,
            failedArguments: args,
          },
          null,
          2,
        ),
      },
    ],
  };
};

export const validateRelationships = async (
  req: any,
  {
    collection_id,
    category_ids,
    tag_ids,
  }: {
    collection_id?: string;
    category_ids?: string[];
    tag_ids?: string[];
  },
) => {
  const errors: string[] = [];

  if (collection_id) {
    const collectionService = req.scope.resolve('collectionService');
    try {
      await collectionService.retrieve(collection_id);
    } catch (error) {
      errors.push(`Collection with ID ${collection_id} not found`);
    }
  }

  if (category_ids?.length) {
    const categoryService = req.scope.resolve('productCategoryService');
    for (const id of category_ids) {
      try {
        await categoryService.retrieve(id);
      } catch (error) {
        errors.push(`Category with ID ${id} not found`);
      }
    }
  }

  if (tag_ids?.length) {
    const tagService = req.scope.resolve('productTagService');
    for (const id of tag_ids) {
      try {
        await tagService.retrieve(id);
      } catch (error) {
        errors.push(`Tag with ID ${id} not found`);
      }
    }
  }

  if (errors.length) {
    throw new ToolExecutionError(errors.join(', '));
  }
};

import { formatPrice, getCheapestProductVariant, getVariantFinalPrice, getVariantPrices } from '@libs/util/prices';
import type { MetaFunction } from '@remix-run/node';
import { UIMatch } from '@remix-run/react';
import { getCommonMeta, getParentMeta, mergeMeta } from './meta';
import { RootLoaderResponse } from './server/root.server';
import { StoreProduct, StoreProductOption, StoreProductOptionValue, StoreProductVariant } from '@medusajs/types';

/**
 * Finds a variant that matches all selected options
 */
export const getVariantBySelectedOptions = (
  variants: StoreProductVariant[],
  options: Record<string, string>,
): StoreProductVariant | undefined =>
  variants.find((variant) => variant.options?.every((option) => options[option.option_id!] === option.value));

/**
 * Selects a variant from the variant matrix based on selected options
 */
export const selectVariantFromMatrixBySelectedOptions = (
  matrix: VariantMatrix,
  selectedOptions?: string[],
): StoreProductVariant | undefined => {
  if (!selectedOptions) return undefined;
  const serialized = selectedOptions.join('|');
  return matrix[serialized];
};

interface VariantMatrix {
  [optionCombination: string]: StoreProductVariant;
}

interface VariantDiscount {
  valueOff: number; // in cents
  percentageOff: number;
}

/**
 * Calculates discount information for a variant if applicable
 * Returns undefined if there is no discount
 */
export const selectDiscountFromVariant = (variant?: StoreProductVariant): VariantDiscount | undefined => {
  if (!variant) return undefined;

  const { original, calculated } = getVariantPrices(variant);

  // If either price is missing or there's no discount, return undefined
  if (!original || !calculated || calculated >= original) return undefined;

  const valueOff = original - calculated;
  const percentageOff = (valueOff / original) * 100;

  return {
    valueOff,
    percentageOff,
  };
};

/**
 * Generates all possible combinations of option values
 */
const generateOptionCombinations = (options: StoreProductOption[]): string[][] => {
  if (!options.length) return [[]];

  const [first, ...rest] = options;
  const subCombinations = generateOptionCombinations(rest);

  return (
    first.values?.reduce((acc: string[][], optionValue: StoreProductOptionValue) => {
      const value = optionValue.value;
      const newCombinations = subCombinations.map((sub) => [value, ...sub]);
      return [...acc, ...newCombinations];
    }, [] as string[][]) || []
  );
};

/**
 * Creates a matrix of variants indexed by their option combinations
 * This allows for quick lookup of variants based on selected options
 */
export const selectVariantMatrix = (product: StoreProduct): VariantMatrix => {
  const options = product.options || [];
  const variants = product.variants || [];
  const matrix: VariantMatrix = {};

  // Generate all possible option combinations
  const allCombinations = generateOptionCombinations(options);

  // Populate the matrix with variants for each combination
  allCombinations.forEach((combination) => {
    const serialized = combination.join('|');
    const matchingVariant = variants.find((variant) =>
      variant.options?.every((option) => combination.includes(option.value)),
    );

    if (matchingVariant) {
      matrix[serialized] = matchingVariant;
    }
  });

  return matrix;
};

/**
 * Filters option values based on previously selected options
 * Returns only option values that lead to valid variants
 * For the first option, returns all values
 * For subsequent options, filters based on compatibility with previous selections
 */
export function getFilteredOptionValues(
  product: StoreProduct,
  selectedOptions: Record<string, string>,
  currentOptionId: string,
): StoreProductOptionValue[] {
  const options = product.options || [];
  const currentOptionIndex = options.findIndex((option) => option.id === currentOptionId);

  // For the first option (index 0), always show all values
  if (currentOptionIndex === 0) {
    const currentOption = options.find((option) => option.id === currentOptionId);
    return currentOption?.values || [];
  }

  // Get all options that come before the current one in the sequence
  const previousOptionIds = options
    .slice(0, currentOptionIndex)
    .map((option) => option.id)
    .filter(Boolean);

  // Only consider selections for options that come before the current one
  const relevantSelectedOptions = Object.entries(selectedOptions).filter(
    ([optionId, value]) => previousOptionIds.includes(optionId) && value !== '',
  );

  // If no previous options are selected, return all values for this option
  if (relevantSelectedOptions.length === 0) {
    const currentOption = options.find((option) => option.id === currentOptionId);
    return currentOption?.values || [];
  }

  // Filter variants that match our already selected options
  const availableVariants = product.variants?.filter((variant) => {
    return relevantSelectedOptions.every(([optionId, value]) => {
      const variantOption = variant.options?.find((option) => option.option_id === optionId);
      return variantOption ? variantOption.value === value : true;
    });
  });

  // Get all possible values for current option from filtered variants
  const possibleValues = new Set<string>();
  availableVariants?.forEach((variant) => {
    const optionValue = variant.options?.find((o) => o.option_id === currentOptionId)?.value;
    if (optionValue) possibleValues.add(optionValue);
  });

  // Filter the option values to only include those in our possible values set
  const currentOption = options.find((option) => option.id === currentOptionId);
  return currentOption?.values?.filter((optionValue) => possibleValues.has(optionValue.value)) || [];
}

/**
 * Generates price information for option values
 * For non-final options, includes price ranges when applicable
 * For final options, includes exact prices for the selected combination
 */
export const getOptionValuesWithDiscountLabels = (
  productOptionIndex: number,
  currencyCode: string,
  optionValues: StoreProductOptionValue[],
  variantMatrix: VariantMatrix,
  selectedOptions?: string[],
): (StoreProductOptionValue & {
  minPrice?: number;
  maxPrice?: number;
  exactPrice?: number;
  discountPercentage?: number;
})[] => {
  // Determine if this is the last option in the sequence
  const isLastOption = selectedOptions && productOptionIndex === selectedOptions.length - 1;
  const optionId = optionValues[0]?.option_id;

  return optionValues.map((optionValue) => {
    // For non-final options (like Duration), check if we should show a price range
    if (!isLastOption) {
      // Find all variants that have this option value
      const allVariantsWithThisOption = Object.values(variantMatrix).filter((variant) =>
        variant.options?.some((o) => o.option_id === optionId && o.value === optionValue.value),
      );

      // If we have variants with this option value
      if (allVariantsWithThisOption.length > 0) {
        // Get all prices for these variants
        const prices = allVariantsWithThisOption.map((variant) => getVariantFinalPrice(variant));
        const uniquePrices = [...new Set(prices)].sort((a, b) => a - b);

        // If there are multiple unique prices, return a range
        if (uniquePrices.length > 1) {
          const minPrice = uniquePrices[0];
          const maxPrice = uniquePrices[uniquePrices.length - 1];

          return {
            ...optionValue,
            minPrice,
            maxPrice,
          };
        } else {
          // If there's only one price, return it as both min and max
          return {
            ...optionValue,
            minPrice: uniquePrices[0],
            maxPrice: uniquePrices[0],
          };
        }
      }
    }

    // For final options or when we need an exact match
    // Create a copy of selectedOptions with the current option value
    const currentOptionWithSelectOptions = selectedOptions?.map((selectedOption, selectedOptionIndex) => {
      if (selectedOptionIndex === productOptionIndex) return optionValue.value;
      return selectedOption;
    });

    // Try to find an exact variant match
    const variantForCurrentOption = selectVariantFromMatrixBySelectedOptions(
      variantMatrix,
      currentOptionWithSelectOptions,
    );

    // If we have an exact variant match, return its price
    if (variantForCurrentOption) {
      const finalPrice = getVariantFinalPrice(variantForCurrentOption);
      const discount = selectDiscountFromVariant(variantForCurrentOption);

      return {
        ...optionValue,
        exactPrice: finalPrice,
        discountPercentage: discount?.percentageOff ? Math.round(discount.percentageOff) : undefined,
      };
    }

    // Fallback if no variants found
    return { ...optionValue };
  });
};

/**
 * Finds a variant that exactly matches the selected options
 * Returns undefined if no exact match is found
 */
export function getVariantFromSelectedOptions(
  product: StoreProduct,
  selectedOptions: Record<string, string>,
): StoreProductVariant | undefined {
  // Filter out any empty selections
  const validSelections = Object.entries(selectedOptions).filter(([_, value]) => value !== '');

  // If no valid selections, return undefined
  if (validSelections.length === 0) {
    return undefined;
  }

  // Find a variant that matches all selected options
  return product.variants?.find((variant) => {
    // A variant matches if all selected options match its option values
    return validSelections.every(([optionId, selectedValue]) => {
      const variantOption = variant.options?.find((option) => option.option_id === optionId);
      return variantOption?.value === selectedValue;
    });
  });
}

export const getProductMeta: MetaFunction = ({ data, matches }) => {
  const rootMatch = matches[0] as UIMatch<RootLoaderResponse>;
  const region = rootMatch.data?.region;
  const product = (data as any).product as StoreProduct;
  const defaultVariant = getCheapestProductVariant(product);

  if (!product) return [];

  const title = product.title;
  const description = product.description;
  const ogTitle = title;
  const ogDescription = description;
  const ogImage = product.thumbnail || product.images?.[0]?.url;
  const ogImageAlt = !!ogImage ? `${title} product thumbnail` : undefined;

  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: ogTitle },
    { property: 'og:description', content: ogDescription },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: ogImageAlt },
    { property: 'og:type', content: 'product' },
    { property: 'product:price:currency', content: region.currency_code },
    {
      property: 'product:price:amount',
      content: formatPrice(getVariantFinalPrice(defaultVariant), {
        currency: region.currency_code,
      }),
    },
  ];
};

export const getMergedProductMeta = mergeMeta(getParentMeta, getCommonMeta, getProductMeta);

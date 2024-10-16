import { formatPrice, getCheapestProductVariant, getVariantFinalPrice, getVariantPrices } from '@libs/util/prices';
import type { MetaFunction } from '@remix-run/node';
import { UIMatch } from '@remix-run/react';
import { getCommonMeta, getParentMeta, mergeMeta } from './meta';
import { RootLoaderResonse } from './server/root.server';
import { StoreProduct, StoreProductOption, StoreProductOptionValue, StoreProductVariant } from '@medusajs/types';

export const getVariantBySelectedOptions = (
  variants: StoreProductVariant[],
  options: Record<string, string>,
): StoreProductVariant | undefined => variants.find((v) => v.options?.every((o) => options[o.option_id!] === o.value));

export const selectVariantFromMatrixBySelectedOptions = (matrix: VariantMatrix, selectedOptions?: string[]) => {
  if (!selectedOptions) return;
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

export const selectDiscountFromVariant: (variant?: StoreProductVariant) => VariantDiscount | undefined = (variant) => {
  if (!variant) return;

  const { original, calculated } = getVariantPrices(variant);

  if (!original || !calculated) return;
  const valueOff = original - calculated;
  const percentageOff = (valueOff / original) * 100;
  if (valueOff <= 0 || percentageOff <= 0) return;

  return {
    valueOff,
    percentageOff,
  };
};

// Generates all the combination of option values given a set of options
const generateOptionCombinations = (options: StoreProductOption[]): string[][] => {
  if (!options.length) return [[]];

  const [first, ...rest] = options;
  const subCombinations = generateOptionCombinations(rest);

  return (
    first.values?.reduce((acc: string[][], productOptionValue: StoreProductOptionValue) => {
      const value = productOptionValue.value;
      const newCombinations: string[][] = subCombinations.map((sub) => [value, ...sub]);
      return [...acc, ...newCombinations];
    }, [] as string[][]) || []
  );
};

export const selectVariantMatrix = (product: StoreProduct): VariantMatrix => {
  const options = product.options || [];
  const variants = product.variants || [];
  const priceMatrix: VariantMatrix = {};

  // Generate all possible option combinations
  const allCombinations = generateOptionCombinations(options);

  // Populate the priceMatrix with variants for each combination
  allCombinations.forEach((combination) => {
    const serialized = combination.join('|');
    const correspondingVariant = variants.find((variant) => {
      return variant.options?.every((o) => combination.includes(o.value));
    });

    if (correspondingVariant) {
      priceMatrix[serialized] = correspondingVariant;
    }
  });

  return priceMatrix;
};

export function getFilteredOptionValues(
  product: StoreProduct,
  selectedOptions: Record<string, string>,
  currentOptionId: string,
): StoreProductOptionValue[] {
  const otherSelectedOptions = { ...selectedOptions };
  delete otherSelectedOptions[currentOptionId];

  // Filter out unselected (empty string) options
  const filteredSelectedOptions = Object.entries(otherSelectedOptions).filter(([_, value]) => value !== '');

  // Check if no other options are selected
  const noOtherOptionsSelected = filteredSelectedOptions.length === 0;

  const options = product.options;
  return (
    options
      ?.find((option) => option.id === currentOptionId)
      ?.values?.filter((optionValue) => {
        // Return all values if no other options are selected
        if (noOtherOptionsSelected) {
          return true;
        }

        return product.variants?.some((variant) => {
          const variantOptionIds = variant.options?.map((option) => option.option_id) || [];

          return (
            variantOptionIds.includes(currentOptionId) &&
            variant.options?.find((option) => option.option_id === currentOptionId)?.value === optionValue.value &&
            filteredSelectedOptions.every(([optionId, value]) => {
              const variantOption = variant.options?.find((option) => option.option_id === optionId);
              return variantOption ? variantOption.value === value : true;
            })
          );
        });
      }) || []
  );
}

export const getOptionValuesWithDiscountLabels = (
  productOptionIndex: number,
  currencyCode: string,
  optionValues: StoreProductOptionValue[],
  variantMatrix: VariantMatrix,
  selectedOptions?: string[],
) => {
  return optionValues.map((optionValue) => {
    const currentOptionWithSelectOptions = selectedOptions?.map((selectedOption, selectedOptionIndex) => {
      if (selectedOptionIndex === productOptionIndex) return optionValue.value;
      return selectedOption;
    });
    const variantForCurrentOption = selectVariantFromMatrixBySelectedOptions(
      variantMatrix,
      currentOptionWithSelectOptions,
    );

    if (!variantForCurrentOption) return { ...optionValue, label: optionValue.value };

    const price = formatPrice(getVariantFinalPrice(variantForCurrentOption), {
      currency: currencyCode,
    });

    const discount = selectDiscountFromVariant(variantForCurrentOption);
    let label = `${optionValue.value}`;
    let discountOff = discount?.percentageOff;

    if (discountOff) {
      discountOff = Math.round(discountOff);
      label += ` - ${price} (${discountOff}% off)`;
    }

    return {
      ...optionValue,
      label,
    };
  });
};

export const getProductMeta: MetaFunction = ({ data, matches }) => {
  const rootMatch = matches[0] as UIMatch<RootLoaderResonse>;
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

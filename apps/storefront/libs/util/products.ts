import { formatPrice, getCheapestProductVariant, getVariantPrice } from '@marketplace/util/prices';
import type { MetaFunction } from '@remix-run/node';
import { UIMatch } from '@remix-run/react';
import { getProxySrc } from '../../../markethaus/utils/img-proxy';
import { PricedProduct, PricedVariant, ProductOption, ProductOptionValue } from './medusa';
import { getCommonMeta, getParentMeta, mergeMeta } from './meta';
import { getPostMeta } from './posts';
import { RootLoader } from './server/root.server';

export const getVariantBySelectedOptions = (
  variants: PricedVariant[] | PricedVariant[],
  options: Record<string, string>
): PricedVariant | PricedVariant | undefined =>
  variants.find(v => v.options?.every(o => options[o.option_id] === o.value));

export const selectVariantFromMatrixBySelectedOptions = (matrix: VariantMatrix, selectedOptions?: string[]) => {
  if (!selectedOptions) return;
  const serialized = selectedOptions.join('|');
  return matrix[serialized];
};

interface VariantMatrix {
  [optionCombination: string]: PricedVariant;
}

interface VariantDiscount {
  valueOff: number; // in cents
  percentageOff: number;
}

export const selectDiscountFromVariant: (variant?: PricedVariant) => VariantDiscount | undefined = variant => {
  if (!variant) return;
  const { original_price, calculated_price } = variant;
  if (!original_price || !calculated_price) return;
  const valueOff = original_price - calculated_price;
  const percentageOff = (valueOff / original_price) * 100;
  if (valueOff <= 0 || percentageOff <= 0) return;

  return {
    valueOff,
    percentageOff
  };
};

// Generates all the combination of option values given a set of options
const generateOptionCombinations = (options: ProductOption[]): string[][] => {
  if (!options.length) return [[]];

  const [first, ...rest] = options;
  const subCombinations = generateOptionCombinations(rest);

  return (
    first.values?.reduce((acc: string[][], productOptionValue: ProductOptionValue) => {
      const value = productOptionValue.value;
      const newCombinations: string[][] = subCombinations.map(sub => [value, ...sub]);
      return [...acc, ...newCombinations];
    }, [] as string[][]) || []
  );
};

export const selectVariantMatrix = (product: PricedProduct): VariantMatrix => {
  const options = product.options || [];
  const variants = product.variants || [];
  const priceMatrix: VariantMatrix = {};

  // Generate all possible option combinations
  const allCombinations = generateOptionCombinations(options);

  // Populate the priceMatrix with variants for each combination
  allCombinations.forEach(combination => {
    const serialized = combination.join('|');
    const correspondingVariant = variants.find(variant => {
      return variant.options?.every(o => combination.includes(o.value));
    });

    if (correspondingVariant) {
      priceMatrix[serialized] = correspondingVariant;
    }
  });

  return priceMatrix;
};

export function getFilteredOptionValues(
  product: PricedProduct,
  selectedOptions: Record<string, string>,
  currentOptionId: string
): ProductOptionValue[] {
  const otherSelectedOptions = { ...selectedOptions };
  delete otherSelectedOptions[currentOptionId];

  // Filter out unselected (empty string) options
  const filteredSelectedOptions = Object.entries(otherSelectedOptions).filter(([_, value]) => value !== '');

  // Check if no other options are selected
  const noOtherOptionsSelected = filteredSelectedOptions.length === 0;

  const options = product.options;
  return (
    options
      ?.find(option => option.id === currentOptionId)
      ?.values?.filter(optionValue => {
        // Return all values if no other options are selected
        if (noOtherOptionsSelected) {
          return true;
        }

        return product.variants?.some(variant => {
          const variantOptionIds = variant.options?.map(option => option.option_id) || [];

          return (
            variantOptionIds.includes(currentOptionId) &&
            variant.options?.find(option => option.option_id === currentOptionId)?.value === optionValue.value &&
            filteredSelectedOptions.every(([optionId, value]) => {
              const variantOption = variant.options?.find(option => option.option_id === optionId);
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
  optionValues: ProductOptionValue[],
  variantMatrix: VariantMatrix,
  selectedOptions?: string[]
) => {
  return optionValues.map(optionValue => {
    const currentOptionWithSelectOptions = selectedOptions?.map((selectedOption, selectedOptionIndex) => {
      if (selectedOptionIndex === productOptionIndex) return optionValue.value;
      return selectedOption;
    });
    const variantForCurrentOption = selectVariantFromMatrixBySelectedOptions(
      variantMatrix,
      currentOptionWithSelectOptions
    );

    if (!variantForCurrentOption) return { ...optionValue, label: optionValue.value };

    const price = formatPrice(getVariantPrice(variantForCurrentOption, currencyCode), { currency: currencyCode });

    const discount = selectDiscountFromVariant(variantForCurrentOption);
    let label = `${optionValue.value}`;
    let discountOff = discount?.percentageOff;

    if (discountOff) {
      discountOff = Math.round(discountOff);
      label += ` - ${price} (${discountOff}% off)`;
    }

    return {
      ...optionValue,
      label
    };
  });
};

export const getProductMeta: MetaFunction = ({ data, matches }) => {
  const rootMatch = matches[0] as UIMatch<RootLoader>;
  const region = rootMatch.data.region;
  const product = (data as any).product as PricedProduct;
  const defaultVariant = getCheapestProductVariant(product, region.currency_code);

  if (!product) return [];

  const title = product.title;
  const description = product.description;
  const ogTitle = title;
  const ogDescription = description;
  const ogImage = getProxySrc(product.thumbnail || product.images?.[0]?.url);
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
      content: formatPrice(getVariantPrice(defaultVariant, region.currency_code), {
        currency: region.currency_code
      })
    }
  ];
};

export const getMergedProductMeta = mergeMeta(getParentMeta, getCommonMeta, getProductMeta, getPostMeta);

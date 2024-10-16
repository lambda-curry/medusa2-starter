import { StoreCartShippingOption } from '@medusajs/types';
import { getShippingOptionsByProfile } from '../checkout';

export function calculateEstimatedShipping(shippingOptions: StoreCartShippingOption[]): number {
  if (shippingOptions?.length < 1) return 0;

  const shippingOptionsByProfile = getShippingOptionsByProfile(shippingOptions);

  return Object.values(shippingOptionsByProfile).reduce((acc, shippingOptions) => {
    const cheapestOption = shippingOptions.reduce((prev, curr) =>
      (prev.amount || 0) < (curr?.amount || 0) ? prev : curr,
    );

    return acc + (cheapestOption.amount || 0);
  }, 0);
}

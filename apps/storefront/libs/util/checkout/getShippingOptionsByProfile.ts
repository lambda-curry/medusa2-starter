import { StoreCartShippingOption } from '@medusajs/types';

export const getShippingOptionsByProfile = (shippingOptions: StoreCartShippingOption[]) => {
  const shippingOptionsByProfile = shippingOptions.reduce<Record<string, StoreCartShippingOption[]>>(
    (acc, shippingOption) => {
      const profileId = shippingOption.shipping_profile_id;

      if (!profileId) return acc;

      if (!acc[profileId]) acc[profileId] = [];

      acc[profileId].push(shippingOption as any);

      return acc;
    },
    {},
  );

  Object.keys(shippingOptionsByProfile).forEach((profileId) =>
    shippingOptionsByProfile[profileId].sort((a, b) => (a.amount || 0) - (b.amount || 0)),
  );

  return shippingOptionsByProfile;
};

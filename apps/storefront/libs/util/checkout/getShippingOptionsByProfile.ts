import { PricedShippingOption } from '@markethaus/storefront-client';

export const getShippingOptionsByProfile = (shippingOptions: PricedShippingOption[]) => {
  const shippingOptionsByProfile = shippingOptions.reduce<Record<string, PricedShippingOption[]>>(
    (acc, shippingOption) => {
      const profileId = shippingOption['profile_id'];

      if (!profileId) return acc;

      if (!acc[profileId]) acc[profileId] = [];

      acc[profileId].push(shippingOption as any);

      return acc;
    },
    {}
  );

  Object.keys(shippingOptionsByProfile).forEach(profileId =>
    shippingOptionsByProfile[profileId].sort((a, b) => (a.amount || 0) - (b.amount || 0))
  );

  return shippingOptionsByProfile;
};

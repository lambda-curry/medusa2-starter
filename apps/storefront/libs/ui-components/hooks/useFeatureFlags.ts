import { useSiteDetails } from './useSiteDetails';

export const useFeatureFlags = () => {
  const { feature_flags: featureFlags } = useSiteDetails();

  const featureToggleList = featureFlags?.reduce((acc, flag) => ({ ...acc, [flag.key]: flag.value }), {}) || {};

  const isFeatureEnabled = (flag: string) => !!featureToggleList[flag as keyof typeof featureToggleList];

  return { isFeatureEnabled, featureToggleList, featureFlags };
};

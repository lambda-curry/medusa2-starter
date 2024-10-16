import { useRootLoaderData } from './useRootLoaderData';

export const useSiteDetails = () => {
  const data = useRootLoaderData();

  return data.siteDetails || {};
};

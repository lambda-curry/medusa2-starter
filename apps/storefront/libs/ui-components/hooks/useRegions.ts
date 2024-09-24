import { useRootLoaderData } from './useRootLoaderData';

export const useRegions = () => {
  const data = useRootLoaderData();
  return { regions: data?.regions };
};

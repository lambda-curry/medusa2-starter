import { useRootLoaderData } from './useRootLoaderData';

export const useRegion = () => {
  const data = useRootLoaderData();
  if (!data?.region) throw new Error('No region data found, this should be provided in the root loader');
  return { region: data?.region };
};

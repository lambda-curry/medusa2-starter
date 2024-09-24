import { useRootLoaderData } from './useRootLoaderData';

export const useEnv = () => {
  const data = useRootLoaderData();
  if (!data?.env) throw new Error('No env data found, this should be provided in the root loader');
  return { env: data?.env };
};

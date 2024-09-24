import { useRootLoaderData } from './useRootLoaderData';

export const useCustomer = () => {
  const rootData = useRootLoaderData();

  return { customer: rootData?.customer };
};

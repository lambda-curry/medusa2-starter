import { RootLoaderResponse } from '@libs/util/server/root.server';
import { UIMatch, useMatches } from 'react-router';

export const useRootLoaderData = () => {
  const matches = useMatches();
  const rootMatch = matches[0] as UIMatch<RootLoaderResponse>;

  return rootMatch.loaderData;
};

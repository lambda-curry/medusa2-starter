import { UIMatch, useMatches } from '@remix-run/react';
import { RootLoaderResonse } from '@libs/util/server/root.server';

export const useRootLoaderData = () => {
  const matches = useMatches();
  const rootMatch = matches[0] as UIMatch<RootLoaderResonse>;

  return rootMatch.data;
};

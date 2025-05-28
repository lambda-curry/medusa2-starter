import { useQuery } from '@tanstack/react-query';
import type {
  AdminPageBuilderListPostSectionsQuery,
  AdminPageBuilderListPostSectionsResponse,
  PostSection,
} from '@lambdacurry/page-builder-types';

import { sdk } from '../sdk';

const QUERY_KEY = ['post-sections'];

export const useAdminListPostSections = (query: AdminPageBuilderListPostSectionsQuery) => {
  return useQuery<AdminPageBuilderListPostSectionsResponse, Error>({
    queryKey: [...QUERY_KEY, query],
    queryFn: async () => {
      return sdk.admin.pageBuilder.listPostSections(query);
    },
  });
};

export const useAdminFetchPostSection = (id: string) => {
  return useQuery<PostSection>({
    queryKey: [...QUERY_KEY, id],
    queryFn: async () => {
      const sections = await sdk.admin.pageBuilder.listPostSections({
        id,
      } as AdminPageBuilderListPostSectionsQuery);

      return sections?.sections?.[0];
    },
  });
};

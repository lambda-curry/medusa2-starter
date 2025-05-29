import { useQuery } from '@tanstack/react-query';
import type {
  AdminPageBuilderListPostSectionsQuery,
  AdminPageBuilderListPostSectionsResponse,
  PostSection,
} from '@lambdacurry/page-builder-types';

import { sdk } from '../sdk';

export const POST_SECTIONS_QUERY_KEY = ['post-sections'];

export const useAdminListPostSections = (query: AdminPageBuilderListPostSectionsQuery) => {
  return useQuery<AdminPageBuilderListPostSectionsResponse, Error>({
    queryKey: [...POST_SECTIONS_QUERY_KEY, query],
    queryFn: async () => {
      return sdk.admin.pageBuilder.listPostSections(query);
    },
  });
};

export const useAdminFetchPostSection = (id: string) => {
  return useQuery<PostSection>({
    queryKey: [...POST_SECTIONS_QUERY_KEY, id],
    queryFn: async () => {
      const sections = await sdk.admin.pageBuilder.listPostSections({
        id,
      } as AdminPageBuilderListPostSectionsQuery);

      return sections?.sections?.[0];
    },
  });
};

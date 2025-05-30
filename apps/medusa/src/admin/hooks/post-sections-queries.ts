import { useQuery } from '@tanstack/react-query';
import type {
  AdminPageBuilderListPostSectionsQuery,
  AdminPageBuilderListPostSectionsResponse,
  AdminPageBuilderRetrievePostSectionResponse,
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
  return useQuery<PostSection, Error>({
    queryKey: [...POST_SECTIONS_QUERY_KEY, id],
    queryFn: async () => {
      const result = await sdk.admin.pageBuilder.retrievePostSection(id);

      return result?.section;
    },
  });
};

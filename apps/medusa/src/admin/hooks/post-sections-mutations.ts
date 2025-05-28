import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AdminPageBuilderCreatePostSectionBody,
  AdminPageBuilderCreatePostSectionResponse,
  AdminPageBuilderDeletePostSectionResponse,
  AdminPageBuilderUpdatePostSectionBody,
  AdminPageBuilderUpdatePostSectionResponse,
} from '@lambdacurry/page-builder-types';

import { sdk } from '../sdk';

const QUERY_KEY = ['post-sections'];

export const useAdminCreatePostSection = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderCreatePostSectionResponse, Error, AdminPageBuilderCreatePostSectionBody>({
    mutationFn: async (data) => {
      return sdk.admin.pageBuilder.createPostSection(data);
    },
    mutationKey: QUERY_KEY,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminUpdatePostSection = () => {
  const queryClient = useQueryClient();
  return useMutation<
    AdminPageBuilderUpdatePostSectionResponse,
    Error,
    { id: string; data: AdminPageBuilderUpdatePostSectionBody }
  >({
    mutationFn: async ({ id, data }) => {
      const { ...rest } = data;
      return sdk.admin.pageBuilder.updatePostSection(id, rest);
    },
    mutationKey: QUERY_KEY,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminDeletePostSection = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderDeletePostSectionResponse, Error, string>({
    mutationFn: async (id: string) => {
      return sdk.admin.pageBuilder.deletePostSection(id);
    },
    mutationKey: QUERY_KEY,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AdminPageBuilderCreatePostSectionBody,
  AdminPageBuilderCreatePostSectionResponse,
  AdminPageBuilderDeletePostSectionResponse,
  AdminPageBuilderUpdatePostSectionBody,
  AdminPageBuilderUpdatePostSectionResponse,
  AdminPageBuilderDuplicatePostSectionResponse,
} from '@lambdacurry/page-builder-types';

import { sdk } from '../sdk';
import { QUERY_KEYS } from './keys';

export const useAdminCreatePostSection = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderCreatePostSectionResponse, Error, AdminPageBuilderCreatePostSectionBody>({
    mutationFn: async (data) => {
      return sdk.admin.pageBuilder.createPostSection(data);
    },
    mutationKey: QUERY_KEYS.POST_SECTIONS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST_SECTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
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
    mutationKey: QUERY_KEYS.POST_SECTIONS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST_SECTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    },
  });
};

export const useAdminDeletePostSection = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderDeletePostSectionResponse, Error, string>({
    mutationFn: async (id: string) => {
      return sdk.admin.pageBuilder.deletePostSection(id);
    },
    mutationKey: QUERY_KEYS.POST_SECTIONS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST_SECTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    },
  });
};

export const useAdminDuplicatePostSection = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderDuplicatePostSectionResponse, Error, string>({
    mutationFn: async (id) => {
      return sdk.admin.pageBuilder.duplicatePostSection(id);
    },
    mutationKey: QUERY_KEYS.POST_SECTIONS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST_SECTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    },
  });
};

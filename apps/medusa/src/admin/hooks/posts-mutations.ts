import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  AdminPageBuilderCreatePostBody,
  AdminPageBuilderCreatePostResponse,
  AdminPageBuilderDeletePostResponse,
  AdminPageBuilderDuplicatePostResponse,
  AdminPageBuilderUpdatePostBody,
  AdminPageBuilderUpdatePostResponse,
} from '@lambdacurry/page-builder-types';

import { sdk } from '../sdk';
import { QUERY_KEYS } from './keys';

export const useAdminCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderCreatePostResponse, Error, AdminPageBuilderCreatePostBody>({
    mutationFn: async (data) => {
      return sdk.admin.pageBuilder.createPost(data);
    },
    mutationKey: QUERY_KEYS.POSTS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    },
  });
};

export const useAdminUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderUpdatePostResponse, Error, { id: string; data: AdminPageBuilderUpdatePostBody }>({
    mutationFn: async ({ id, data }) => {
      const { ...rest } = data;
      return sdk.admin.pageBuilder.updatePost(id, rest);
    },
    mutationKey: QUERY_KEYS.POSTS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    },
  });
};

export const useAdminDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderDeletePostResponse, Error, string>({
    mutationFn: async (id: string) => {
      return sdk.admin.pageBuilder.deletePost(id);
    },
    mutationKey: QUERY_KEYS.POSTS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    },
  });
};

export const useAdminDuplicatePost = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderDuplicatePostResponse, Error, string>({
    mutationFn: async (id: string) => {
      return sdk.admin.pageBuilder.duplicatePost(id);
    },
    mutationKey: QUERY_KEYS.POSTS,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS });
    },
  });
};

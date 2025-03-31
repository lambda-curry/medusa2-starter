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

const QUERY_KEY = ['posts'];

export const useAdminCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderCreatePostResponse, Error, AdminPageBuilderCreatePostBody>({
    mutationFn: async (data) => {
      return sdk.admin.pageBuilder.createPost(data);
    },
    mutationKey: QUERY_KEY,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderUpdatePostResponse, Error, AdminPageBuilderUpdatePostBody>({
    mutationFn: async (data) => {
      return sdk.admin.pageBuilder.updatePost(data.id, data);
    },
    mutationKey: QUERY_KEY,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderDeletePostResponse, Error, string>({
    mutationFn: async (id: string) => {
      return sdk.admin.pageBuilder.deletePost(id);
    },
    mutationKey: QUERY_KEY,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminDuplicatePost = () => {
  const queryClient = useQueryClient();
  return useMutation<AdminPageBuilderDuplicatePostResponse, Error, string>({
    mutationFn: async (id: string) => {
      return sdk.admin.pageBuilder.duplicatePost(id);
    },
    mutationKey: QUERY_KEY,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

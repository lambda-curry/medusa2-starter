import {
  AdminCreateProductReviewResponseDTO,
  AdminListProductReviewsQuery,
  AdminListProductReviewsResponse,
  AdminUpdateProductReviewResponseDTO,
} from '@markethaus/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../../sdk';

const QUERY_KEY = ['product-reviews'];

export const useAdminListProductReviews = (query: AdminListProductReviewsQuery) => {
  return useQuery<AdminListProductReviewsResponse, AdminListProductReviewsQuery>({
    queryKey: [...QUERY_KEY, query],
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      return sdk.admin.productReviews.list(query);
    },
  });
};

export const useAdminCreateProductReviewResponseMutation = (reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: AdminCreateProductReviewResponseDTO) => {
      return await sdk.admin.productReviews.createResponse(reviewId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

export const useAdminUpdateProductReviewResponseMutation = (reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: AdminUpdateProductReviewResponseDTO) => {
      return await sdk.admin.productReviews.updateResponse(reviewId, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
};

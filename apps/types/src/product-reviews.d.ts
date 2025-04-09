export type AdminCreateProductReviewResponseDTO = {
  content: string;
};

export type AdminUpdateProductReviewResponseDTO = {
  content: string;
};

export type AdminListProductReviewsQuery = {
  q?: string;
  id?: string | string[];
  product_id?: string | string[];
  order_id?: string | string[];
  order_item_id?: string | string[];
  rating?: number | number[];
  limit?: number;
  offset?: number;
};

export type AdminListProductReviewsResponse = {
  product_reviews: AdminProductReview[];
  count: number;
  offset: number;
  limit: number;
};

export type AdminProductReview = {
  id: string;
  content: string;
  rating: number;
  name: string;
  email: string;
  order_id?: string;
  product_id?: string;
  order_item_id?: string;
  images: {
    url: string;
  }[];
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    thumbnail?: string;
    title: string;
  };
  order: {
    id: string;
    display_id: string;
  };
  response?: AdminProductReviewResponse;
};

export type AdminProductReviewResponse = {
  content: string;
  product_review_id: string;
  created_at: string;
  updated_at: string;
};

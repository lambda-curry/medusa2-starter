export type ProductReviewStatus = 'pending' | 'approved' | 'flagged';

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
  status: ProductReviewStatus;
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

// Storefront

export type StoreListProductReviewsQuery = {
  offset: number;
  limit: number;
  fields?: string | undefined;
  order?: string | undefined;
  id?: string | string[] | undefined;
  status?: ProductReviewStatus | ProductReviewStatus[] | undefined;
  product_id?: string | string[] | undefined;
  order_id?: string | string[] | undefined;
  rating?: number | number[] | undefined;
  created_at?: any;
  updated_at?: any;
}

export type StoreListProductReviewsResponse = {
  product_reviews: StoreProductReview[];
  count: number;
  offset: number;
  limit: number;
};


export type StoreProductReviewResponse = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  product_review_id: string;
}

export type StoreProductReview = {
  id: string;
  content: string;
  rating: number;
  name: string;
  email: string;
  product_id?: string;
  order_item_id?: string;
  images: {
    url: string;
  }[];
  created_at: string;
  updated_at: string;
  response?: StoreProductReviewResponse;
};


export type StoreUpsertProductReviewsDTO = {
  reviews: {
    order_id: string;
    order_line_item_id: string;
    rating: number;
    content: string;
    images: {url:string}[];
  }[];
};

export type StoreUpsertProductReviewsResponse = {
  product_reviews: StoreProductReview[];
};


export type StoreUploadProductReviewImagesResponse = {
  uploads: [{
    url: string;
    key: string;
  }] | {
    url: string;
    key: string;
  } | undefined
}
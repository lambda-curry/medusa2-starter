export type StoreProductReviewStats = {
  id: string;
  product_id: string;
  average_rating: number | null;
  review_count: number;
  rating_count_1: number;
  rating_count_2: number;
  rating_count_3: number;
  rating_count_4: number;
  rating_count_5: number;
  raw_average_rating: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type StoreListProductReviewStatsResponse = {
  product_review_stats: StoreProductReviewStats[];
  count: number;
  offset: number;
  limit: number;
}

export type StoreListProductReviewStatsQuery = {
  offset: number;
  limit: number;
  fields?: string | undefined;
  order?: string | undefined;
  id?: string | string[] | undefined;
  product_id?: string | string[] | undefined;
  average_rating?: number | number[] | undefined;
  created_at?: any;
  updated_at?: any;
}

import type { FC } from 'react';
import clsx from 'clsx';
import StarIcon from '@heroicons/react/24/solid/StarIcon';
import { StarRating } from './StarRating';
import { StoreProductReviewStats } from '@lambdacurry/medusa-plugins-sdk';

export interface ProductReviewSummaryProps {
  stats?: StoreProductReviewStats;
  count?: number;
  className?: string;
}

const ReviewRating: FC<{ rating: number; rating_count: number; count: number }> = ({ rating, rating_count, count }) => {
  return (
    <div key={rating} className="flex items-center text-sm">
      <dt className="flex flex-1 items-center">
        <p className="w-3 font-medium text-gray-900">
          {rating}
          <span className="sr-only"> star reviews</span>
        </p>
        <div aria-hidden="true" className="ml-1 flex flex-1 items-center">
          <StarIcon
            className={clsx(count > 0 ? 'text-amber-400' : 'text-gray-300', 'h-5 w-5 flex-shrink-0')}
            aria-hidden="true"
          />

          <div className="relative ml-3 flex-1">
            <div className="h-3 rounded-full border border-gray-200 bg-gray-100" />
            {count > 0 ? (
              <div
                className="absolute inset-y-0 rounded-full border border-amber-400 bg-amber-400"
                style={{ width: `calc(${rating_count} / ${count} * 100%)` }}
              />
            ) : null}
          </div>
        </div>
      </dt>
      <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">
        {Math.round((rating_count / count) * 100)}%
      </dd>
    </div>
  );
};

export const ProductReviewSummary: FC<ProductReviewSummaryProps> = ({ stats, count = 0, className }) => {
  return (
    <div className={className}>
      {stats && (
        <>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customer Reviews</h2>

          <div className="mt-3 flex items-center">
            <div>
              <div className="flex items-center">
                <StarRating value={stats.average_rating as number} readOnly />
              </div>
              <p className="sr-only">{stats.average_rating} out of 5 stars</p>
            </div>
            <p className="ml-2 mt-1 text-sm text-gray-900">
              Based on {count} review{count > 1 && 's'}
            </p>
          </div>
          <div className="mt-4">
            <h3 className="sr-only">Review data</h3>

            <dl className="space-y-3">
              <ReviewRating rating={5} rating_count={stats.rating_count_5} count={count} />
              <ReviewRating rating={4} rating_count={stats.rating_count_4} count={count} />
              <ReviewRating rating={3} rating_count={stats.rating_count_3} count={count} />
              <ReviewRating rating={2} rating_count={stats.rating_count_2} count={count} />
              <ReviewRating rating={1} rating_count={stats.rating_count_1} count={count} />
            </dl>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductReviewSummary;

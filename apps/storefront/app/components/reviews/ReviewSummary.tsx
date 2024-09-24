import type { FC } from 'react';
import clsx from 'clsx';
import StarIcon from '@heroicons/react/24/solid/StarIcon';
import { StarRating } from './StarRating';

export interface ProductReviewSummaryProps {
  stats?: {
    average: number;
    count: number;
    by_rating: { count: number; rating: number }[];
  };
  className?: string;
}

export const ProductReviewSummary: FC<ProductReviewSummaryProps> = ({ stats, className }) => {
  return (
    <div className={className}>
      {stats && (
        <>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customer Reviews</h2>

          <div className="mt-3 flex items-center">
            <div>
              <div className="flex items-center">
                <StarRating value={stats.average} readOnly />
              </div>
              <p className="sr-only">{stats.average} out of 5 stars</p>
            </div>
            <p className="ml-2 mt-1 text-sm text-gray-900">
              Based on {stats.count} review{stats.count > 1 && 's'}
            </p>
          </div>
          <div className="mt-4">
            <h3 className="sr-only">Review data</h3>

            <dl className="space-y-3">
              {stats.by_rating
                .sort((a, b) => (a.rating < b.rating ? 1 : -1))
                .map(({ rating, count }) => {
                  if (rating === 0) return;

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
                                style={{ width: `calc(${count} / ${stats.count} * 100%)` }}
                              />
                            ) : null}
                          </div>
                        </div>
                      </dt>
                      <dd className="ml-3 w-10 text-right text-sm tabular-nums text-gray-900">
                        {Math.round((count / stats.count) * 100)}%
                      </dd>
                    </div>
                  );
                })}
            </dl>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductReviewSummary;

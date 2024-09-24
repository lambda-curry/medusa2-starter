import { FC } from 'react';
import { ProductReviewStats } from '../../../libs/util';
import { StarRating } from './StarRating';
import { Link } from '@remix-run/react';

interface ProductReviewStarsProps {
  reviewStats?: ProductReviewStats;
}

export const ProductReviewStars: FC<ProductReviewStarsProps> = ({ reviewStats }) => {
  if (!reviewStats || reviewStats.count < 1) return null;

  return (
    <div className="flex items-center gap-1">
      <StarRating value={reviewStats?.average || 0} readOnly />

      <Link to="#reviews" className="ml-1 mt-[1px] flex text-xs">
        <div className="mr-1 hover:underline">
          {' '}
          {reviewStats?.count} Review
          {`
        ${reviewStats?.count > 1 ? 's' : ''}
        `}
        </div>
      </Link>
    </div>
  );
};

import clsx from 'clsx';
import { StarIcon } from '@heroicons/react/24/solid';
import { ProductReviewStats } from '../../../libs/util';

export const RatingsBadge = ({ className, stats }: { className?: string; stats?: ProductReviewStats }) => {
  if (!stats || stats.average < 4) return null;

  return (
    <div
      className={clsx(
        'inline-flex items-center rounded-md border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-800',
        className
      )}
    >
      {stats.average.toFixed(1)} <StarIcon className="ml-0.5 h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
    </div>
  );
};

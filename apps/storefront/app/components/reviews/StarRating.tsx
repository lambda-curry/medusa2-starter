import { Rating, RatingProps, RoundedStar } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';
import { FC } from 'react';

export const StarRating: FC<
  Omit<RatingProps, 'value'> & {
    value?: number | undefined;
    includeLink?: boolean;
    className?: string;
  }
> = ({ value, ...props }) => {
  if (typeof value !== 'number') return null;

  return (
    <Rating
      style={{ maxWidth: 120 }}
      itemStyles={{
        itemShapes: RoundedStar,
        activeFillColor: '#fbbf24',
        inactiveFillColor: '#bdbdbd'
      }}
      value={value}
      {...props}
    />
  );
};

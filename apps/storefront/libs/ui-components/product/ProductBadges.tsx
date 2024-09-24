import { FC, HTMLAttributes } from 'react';
import { ProductWithReviews } from '../../util';
import { useProductInventory } from '../hooks/useProductInventory';
import { HasSaleBadge } from '~/components/badges/HasSaleBadge';
import { RatingsBadge } from '~/components/badges/RatingsBadge';
import { SoldOutBadge } from '~/components/badges/SoldOutBadge';
// import { CountRemainingBadge } from '../shared/badges/CountRemainingBadge';
import { DateTime } from 'luxon';
import { useProductPriceDetails } from '../hooks/useProductPriceDetails';

interface ProductBadgesProps extends HTMLAttributes<HTMLElement> {
  product: ProductWithReviews;
  className?: string;
}

export const ProductBadges: FC<ProductBadgesProps> = ({ product, className }) => {
  const productInventory = useProductInventory(product);
  const isSoldOut = productInventory.averageInventory === 0;
  const { hasSale, earliestSaleEnds } = useProductPriceDetails(product);

  // const totalInventory = productInventory.totalInventory;
  // TODO: figure out an elegant way to show this badge that doesn't show up on every product if we don't want it to

  // use luxon date time to see if the earliest sale ends is less than a week away from now
  const saleEndsSoon = !!earliestSaleEnds && DateTime.fromJSDate(earliestSaleEnds).diffNow('days').days < 7;

  return (
    <div className={className}>
      <RatingsBadge stats={product.reviewStats} />
      {isSoldOut && <SoldOutBadge />}
      {!isSoldOut && hasSale && <HasSaleBadge endingSoon={saleEndsSoon} />}
      {/* {!isSoldOut && totalInventory <= 5 && <CountRemainingBadge count={totalInventory} />} */}
    </div>
  );
};

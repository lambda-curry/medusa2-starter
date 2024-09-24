import { EmptyProductListItem } from './EmptyProductListItem';

export const ProductCarouselSkeleton = ({ length }: { length: number }) => (
  <div className="xs:grid-cols-2 grid grid-cols-1 gap-y-10 gap-x-6 md:!grid-cols-3 xl:!grid-cols-4 xl:gap-x-8">
    {Array.from({ length }, (_, i) => (
      <EmptyProductListItem key={i} />
    ))}
  </div>
);

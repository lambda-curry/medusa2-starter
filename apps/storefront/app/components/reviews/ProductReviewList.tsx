import { type FC, useState } from 'react';
import { ReviewImageThumbnailRow } from './ReviewImageThumbnailRow';
import { StarRating } from './StarRating';
import { StoreProductReview } from '@lambdacurry/medusa-plugins-sdk';
import { formatDate } from '@libs/util';
import { LightboxGallery } from '@app/components/common/images/LightboxGallery';

export interface ProductReviewListProps {
  productReviews?: StoreProductReview[];
  className?: string;
}

type ReviewWithOrder = StoreProductReview & {
  order: {
    billing_address: { first_name: string; last_name: string };
    customer: { first_name: string; last_name: string };
  };
};

const getCustomerName = (review: ReviewWithOrder) => {
  if (review.order?.customer?.first_name && review.order?.customer?.last_name) {
    return `${review.order.customer.first_name} ${review.order.customer.last_name}`;
  }

  if (review.order?.billing_address?.first_name && review.order?.billing_address?.last_name) {
    return `${review.order.billing_address.first_name} ${review.order.billing_address.last_name}`;
  }

  return 'Anonymous';
};

export const ProductReviewList: FC<ProductReviewListProps> = ({ productReviews }) => {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  return (
    <div>
      {productReviews && productReviews.length > 0 && (
        <div className="-my-12 divide-y divide-gray-200">
          {productReviews.map((review, reviewIndex) => {
            const galleryImages = (review.images || []).map((image) => ({
              url: image.url,
              alt: "Customer's review image",
              name: "Customer's review image",
            }));

            return (
              <div key={review.id} className="py-8">
                <div className=" flex items-center justify-between">
                  <h3 className="mr-2 text-sm font-bold ">{getCustomerName(review as ReviewWithOrder)}</h3>
                  <div className="mt-1 flex items-center pb-1">
                    <StarRating value={review.rating ?? 0} readOnly />
                  </div>
                  <p className="sr-only">{review.rating} out of 5 stars</p>
                </div>
                <time className="text-xs italic text-gray-900" dateTime={review.created_at}>
                  {formatDate(new Date(review.created_at))}
                </time>

                <div
                  className="mt-4 space-y-6 text-base italic text-gray-600"
                  dangerouslySetInnerHTML={{ __html: review.content }}
                />

                {galleryImages.length > 0 && (
                  <>
                    <ReviewImageThumbnailRow galleryImages={galleryImages} onClick={setLightboxIndex} />
                    <LightboxGallery
                      images={galleryImages.map(({ url, ...image }) => ({ ...image, src: url }))}
                      lightBoxIndex={lightboxIndex}
                      setLightBoxIndex={setLightboxIndex}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

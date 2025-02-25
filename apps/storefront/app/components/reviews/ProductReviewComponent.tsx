import { FC, useState } from 'react';
import { ProductReviewView } from './ProductReviewView';
import { ProductReviewForm } from './ProductReviewForm';
import { StoreProductReview } from '@lambdacurry/medusa-plugins-sdk';
import { StoreOrderLineItem } from '@medusajs/types';
import { Image } from '@app/components/common/images/Image';

export interface ProductReviewProps {
  lineItem?: StoreOrderLineItem;
  productReview?: StoreProductReview;
  requestId?: string;
  orderId: string;
}

export const ProductReviewComponent: FC<ProductReviewProps> = ({ lineItem, productReview, requestId, orderId }) => {
  if (!lineItem) return null;

  const [editing, setEditing] = useState<boolean>(!productReview);

  return (
    <div className="xs:grid my-4 grid-cols-6 gap-8 sm:grid-cols-5">
      {lineItem.thumbnail && (
        <div className="col-span-2 mb-2 sm:col-span-1 sm:mb-0">
          <Image
            src={lineItem.thumbnail}
            alt={lineItem.title}
            className=" h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
          />
        </div>
      )}
      <div className="col-span-4 flex flex-auto flex-col gap-y-2">
        {!editing && productReview ? (
          <ProductReviewView
            lineItem={lineItem}
            rating={productReview?.rating}
            content={productReview?.content}
            galleryImages={
              productReview?.images
                ? productReview.images?.map((image) => ({
                    url: image.url,
                    alt: "Customer's review image",
                    name: "Customer's review image",
                  }))
                : undefined
            }
            setEditing={setEditing}
          />
        ) : (
          <ProductReviewForm
            lineItem={lineItem}
            productReview={productReview}
            requestId={requestId}
            setEditing={setEditing}
            orderId={orderId}
          />
        )}
      </div>
    </div>
  );
};

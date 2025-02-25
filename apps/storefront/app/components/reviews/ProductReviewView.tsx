import { FC, useState } from 'react';
import { Link } from '@remix-run/react';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';

import { GalleryImage, ReviewImageThumbnailRow } from './ReviewImageThumbnailRow';
import { StarRating } from './StarRating';
import { LightboxGallery } from '@app/components/common/images/LightboxGallery';
import { StoreOrderLineItem } from '@medusajs/types';
import { IconButton } from '@app/components/common/buttons';

export interface ProductReviewViewProps {
  lineItem: StoreOrderLineItem;
  rating?: number;
  content?: string;
  galleryImages?: GalleryImage[] | undefined;
  setEditing?: (value: boolean) => void;
}

export const ProductReviewView: FC<ProductReviewViewProps> = ({
  lineItem,
  rating,
  content,
  galleryImages,
  setEditing,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  return (
    <>
      <div className="flex flex-wrap justify-between space-y-2">
        <div>
          <h3 className="text-base text-gray-900">
            <Link to={`/products/${lineItem.variant?.product?.handle}`}>{lineItem.title}</Link>
          </h3>

          <p className="text-sm font-normal text-gray-500">{lineItem.variant?.title}</p>
        </div>

        <div className="flex items-center gap-1">
          <StarRating value={rating ?? 0} readOnly />

          {typeof setEditing === 'function' && (
            <IconButton icon={() => <PencilIcon className="text-primary h-5" />} onClick={() => setEditing(true)} />
          )}
        </div>
      </div>

      <div className="rounded border border-gray-200 bg-gray-100 p-2">{content}</div>

      {galleryImages && galleryImages.length > 0 && (
        <>
          <ReviewImageThumbnailRow galleryImages={galleryImages} onClick={setLightboxIndex} />
          <LightboxGallery
            images={galleryImages.map(({ url, ...image }) => ({ ...image, src: url }))}
            lightBoxIndex={lightboxIndex}
            setLightBoxIndex={setLightboxIndex}
          />
        </>
      )}
    </>
  );
};

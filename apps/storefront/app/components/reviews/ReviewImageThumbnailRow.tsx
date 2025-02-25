import { type FC, memo } from 'react';
import { Image } from '@app/components/common/images/Image';
import { ScrollArrowButtons } from '@app/components/common/buttons/ScrollArrowButtons';
import { useScrollArrows } from '@app/hooks/useScrollArrows';
import { MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';

export interface GalleryImage {
  url: string;
  alt?: string;
  name?: string;
}

export interface ReviewImageThumbnailRowProps {
  galleryImages?: GalleryImage[];
  onClick?: (index: number) => void;
}

const GalleryImagesRow: FC<{ galleryImages: GalleryImage[]; onClick?: (index: number) => void }> = memo(
  ({ galleryImages, onClick }) => {
    return (
      <div className="py flex flex-row gap-2 after:block after:h-8 after:w-8 after:min-w-[8px] after:content-[''] md:p-0">
        {galleryImages.map((image, imageIndex) => (
          <div
            onClick={() => {
              if (typeof onClick === 'function') onClick(imageIndex);
            }}
            key={image.url}
            className="group relative flex h-24 w-24 flex-shrink-0 cursor-pointer justify-center overflow-hidden rounded-md border border-gray-100 bg-white text-sm font-bold uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-1"
          >
            <Image
              src={image.url}
              alt="Gallery Image"
              className="h-full w-full object-contain object-center transition group-hover:scale-110"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition group-hover:bg-opacity-50">
              <MagnifyingGlassPlusIcon className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" />
            </div>
          </div>
        ))}
      </div>
    );
  },
);

export const ReviewImageThumbnailRow: FC<ReviewImageThumbnailRowProps> = ({ galleryImages, onClick }) => {
  if (!galleryImages) return null;

  const { scrollableDivRef, showStartArrow, showEndArrow, handleArrowClick } = useScrollArrows({
    buffer: 50,
    resetOnDepChange: [galleryImages],
  });

  return (
    <div className="py-4">
      <h2 className="sr-only">Images</h2>
      <div className="flex flex-col-reverse gap-4">
        {galleryImages.length > 0 && (
          <div className="flex-grow-1 relative mx-auto h-24 w-full pt-4">
            <ScrollArrowButtons
              className="top-1/3"
              showStartArrow={showStartArrow}
              showEndArrow={showEndArrow}
              handleArrowClick={handleArrowClick}
            />

            <div className="relative -m-4 block h-24 overflow-hidden p-8 ">
              <div ref={scrollableDivRef} className="absolute -bottom-4 left-4 right-4 top-0 h-32 overflow-x-auto ">
                <GalleryImagesRow galleryImages={galleryImages} onClick={onClick} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

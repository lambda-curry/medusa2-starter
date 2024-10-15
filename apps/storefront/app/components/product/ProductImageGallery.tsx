import { FC, memo, useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import { Image } from '@app/components/common/images/Image';
import { useScrollArrows } from '@app/hooks/useScrollArrows';
import { ScrollArrowButtons } from '@app/components/common/buttons/ScrollArrowButtons';
import { LightboxGallery } from '@app/components/common/images/LightboxGallery';
import { MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline';
import { StoreProduct } from '@medusajs/types';

export interface ProductGalleryImage {
  id: string;
  url: string;
  alt?: string;
  name?: string;
}

export interface ProductImageGalleryProps {
  product: StoreProduct;
}

const GalleryImagesRow: FC<{ galleryImages: ProductGalleryImage[] }> = memo(({ galleryImages }) => {
  return (
    <>
      {galleryImages.map((image, imageIndex) => (
        <Tab
          key={image.id}
          className={
            'relative mb-0 mr-2 inline-block h-16 w-16 cursor-pointer snap-start whitespace-nowrap rounded-md bg-white text-sm font-bold uppercase text-gray-900 last:mb-0 last:mr-0 hover:bg-gray-50 focus:outline-none focus:ring-0 lg:mb-2 lg:mr-0 lg:whitespace-normal'
          }
        >
          {({ selected }) => (
            <>
              <span className="sr-only">{image.name}</span>
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <Image
                  key={image.id}
                  src={image.url}
                  alt={image.alt || 'tab for image gallery'}
                  className={'h-full w-full object-cover object-center'}
                />
              </span>
              <span
                className={clsx('pointer-events-none absolute inset-0 rounded-md border border-gray-200', {
                  '!border-primary-500 border-2': selected,
                })}
                aria-hidden="true"
              />
            </>
          )}
        </Tab>
      ))}
    </>
  );
});

export const ProductImageGallery: FC<ProductImageGalleryProps> = ({ product }) => {
  const { images: productImages = [], thumbnail } = product;
  const images = productImages ?? [];
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const { scrollableDivRef, showStartArrow, showEndArrow, handleArrowClick } = useScrollArrows({
    buffer: 50,
    resetOnDepChange: [product],
  });

  const gallery: ProductGalleryImage[] =
    images?.length < 1 && thumbnail
      ? [
          {
            id: 'thumbnail',
            name: `Thumbnail for ${product.title}`,
            url: thumbnail,
            alt: product.description || product.title,
          },
        ]
      : (images as ProductGalleryImage[]);

  return (
    <TabGroup as="div" className="flex flex-col-reverse gap-4 lg:flex-row">
      <h2 className="sr-only">Images</h2>
      {gallery.length > 1 && (
        <div className="flex-grow-1 relative mx-auto mb-12 block h-8 w-full lg:mb-0 lg:h-auto lg:max-w-[68px]">
          <TabList
            ref={scrollableDivRef}
            className="absolute bottom-0 left-0 right-0 top-0 h-20 snap-both snap-proximity overflow-x-auto whitespace-nowrap pb-3 lg:-right-4 lg:bottom-0 lg:h-auto lg:overflow-y-auto lg:overflow-x-hidden lg:whitespace-normal lg:px-0 lg:py-0"
          >
            <GalleryImagesRow galleryImages={gallery} />
          </TabList>

          <ScrollArrowButtons
            className="hidden lg:-ml-[18px] lg:flex"
            orientation="vertical"
            showStartArrow={showStartArrow}
            showEndArrow={showEndArrow}
            handleArrowClick={handleArrowClick}
          />
          <ScrollArrowButtons
            className="flex lg:-ml-4 lg:hidden"
            showStartArrow={showStartArrow}
            showEndArrow={showEndArrow}
            handleArrowClick={handleArrowClick}
          />
        </div>
      )}

      <TabPanels className="flex-grow-1 w-full">
        <div className="aspect-1 relative">
          {gallery.length > 0 ? (
            gallery.map((image, imageIndex) => (
              <TabPanel
                key={image.id}
                className="group relative h-full w-full cursor-pointer overflow-hidden sm:rounded-md"
                onClick={() => setLightboxIndex(imageIndex)}
              >
                <Image
                  key={image.id}
                  style={{
                    viewTransitionName: 'product-thumbnail',
                  }}
                  src={image.url}
                  alt={image.alt || 'selected image for product'}
                  className="absolute h-full w-full border-b border-b-gray-200 object-contain object-center sm:rounded-md sm:border sm:border-gray-200"
                />
                <div className="absolute right-2 top-2 flex items-center justify-center rounded-xl bg-gray-800 p-2 opacity-0 transition-all hover:!opacity-75 active:!opacity-95 group-hover:opacity-50">
                  <MagnifyingGlassPlusIcon className="h-6 w-6 text-white" />
                </div>
              </TabPanel>
            ))
          ) : (
            <div className="absolute flex h-full w-full items-center justify-center border-b border-b-gray-200 object-cover object-center sm:rounded-md sm:border sm:border-gray-200">
              No Image
            </div>
          )}
        </div>
      </TabPanels>
      <LightboxGallery
        images={gallery.map((image) => ({
          src: image.url,
          alt: image.alt || 'Product image',
        }))}
        lightBoxIndex={lightboxIndex}
        setLightBoxIndex={setLightboxIndex}
      />
    </TabGroup>
  );
};

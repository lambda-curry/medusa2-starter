import { Container } from '@app/components/common/container';
import { Image, ImageProps } from '@app/components/common/images/Image';
import clsx from 'clsx';
import { ReactNode } from 'react';

interface GridCTAProps {
  className?: string;
  content?: ReactNode;
  images: ImageProps[];
}

const fillEmptyImages = (images: ImageProps[], count: number) => {
  if (images.length >= count) return images;

  return images.concat(Array(count - images.length).fill(null));
};

const SideColumn = ({ images }: { images: ImageProps[] }) => {
  return (
    <div className="flex flex-col flex-1 gap-5 md:max-w-[296px] min-h-[286px]">
      {images.map((image, index) => (
        <div
          key={index}
          className="flex-1 w-full h-full bg-[#9F7F51] bg-cover bg-no-repeat bg-center"
          {...(image ? { style: { backgroundImage: `url(${image.src})` } } : {})}
        />
      ))}
    </div>
  );
};

export const GridCTA = ({ content, className, images }: GridCTAProps) => {
  const halfImages = Math.ceil(images.length / 2);
  const maxImages = Math.max(halfImages, 2);
  const firstHalf = fillEmptyImages(images.slice(0, halfImages), maxImages).reverse();
  const secondHalf = fillEmptyImages(images.slice(halfImages), maxImages);

  return (
    <Container className={clsx('flex flex-col md:flex-row min-h-[610px] gap-5 w-full', className)}>
      <SideColumn images={firstHalf} />
      {content && (
        <div className="flex flex-col flex-1 justify-center items-center bg-accent-50 text-white text-center p-5">
          {content}
        </div>
      )}
      <SideColumn images={secondHalf} />
    </Container>
  );
};

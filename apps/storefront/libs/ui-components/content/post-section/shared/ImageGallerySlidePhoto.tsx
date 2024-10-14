import { RenderSlideProps, Slide, isImageFitCover, isImageSlide, useLightboxProps } from 'yet-another-react-lightbox';
import { ImageBase } from '@ui-components/common/images/ImageBase';

export default function ImageGallerySlidePhoto({
  slide,
  rect,
}: RenderSlideProps<
  Slide & {
    blurDataURL?: string;
  }
>) {
  const { imageFit } = useLightboxProps().carousel;
  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit);

  if (!slide.width || !slide.height) return undefined;

  const width = !cover ? Math.round(Math.min(rect.width, (rect.height / slide.height) * slide.width)) : rect.width;

  const height = !cover ? Math.round(Math.min(rect.height, (rect.width / slide.width) * slide.height)) : rect.height;

  return (
    <div style={{ position: 'relative', width, height }}>
      <ImageBase
        alt={slide.alt || ''}
        src={slide.src}
        loading="eager"
        draggable={false}
        // placeholder={slide.blurDataURL ? 'blur' : undefined}
        style={{ objectFit: cover ? 'cover' : 'contain' }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
      />
    </div>
  );
}

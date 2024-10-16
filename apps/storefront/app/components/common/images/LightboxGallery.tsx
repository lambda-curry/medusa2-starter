import { FC } from 'react';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Lightbox from 'yet-another-react-lightbox';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import { ImageBase } from './ImageBase';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/styles.css';

interface Image {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

interface LightboxProps {
  images: Image[];
  lightBoxIndex: number;
  setLightBoxIndex: (index: number) => void;
}

export const LightboxGallery: FC<LightboxProps> = ({ images, lightBoxIndex, setLightBoxIndex }) => {
  const photos = images.map((image) => ({
    src: image.src,
    alt: image.alt || '',
    description: image.alt,
    width: image.width || 500,
    height: image.height || 500,
  }));

  const lightboxPlugins = [Fullscreen, Zoom, Thumbnails, Captions];

  return (
    <Lightbox
      slides={photos}
      open={lightBoxIndex >= 0}
      index={lightBoxIndex}
      close={() => setLightBoxIndex(-1)}
      plugins={lightboxPlugins}
      zoom={{
        maxZoomPixelRatio: 4,
      }}
      captions={{
        descriptionTextAlign: 'center',
      }}
      render={{
        slide: ({ slide }) => (
          <ImageBase
            src={slide.src}
            alt={slide.alt}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        ),
        thumbnail: ({ slide }) => <ImageBase src={slide.src} alt={slide.alt} />,
      }}
    />
  );
};

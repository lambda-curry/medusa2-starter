import { type FC, lazy, Suspense, useState } from 'react';
import type { LightboxGalleryProps } from './LightboxGalleryImpl';

// yet-another-react-lightbox and its CSS only render after a click, so load them on first open
// instead of in every product page's route chunk.
const LazyLightboxGallery = lazy(() =>
  import('./LightboxGalleryImpl').then((module) => ({ default: module.LightboxGalleryImpl })),
);

export const LightboxGallery: FC<LightboxGalleryProps> = (props) => {
  const isOpen = props.lightBoxIndex >= 0;
  // Stay mounted after the first open so the lightbox can run its close animation.
  const [hasOpened, setHasOpened] = useState(isOpen);
  if (isOpen && !hasOpened) setHasOpened(true);

  if (!hasOpened) return null;

  return (
    <Suspense fallback={null}>
      <LazyLightboxGallery {...props} />
    </Suspense>
  );
};

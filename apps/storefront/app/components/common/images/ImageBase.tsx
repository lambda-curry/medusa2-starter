import { DOMAttributes, useCallback, useState } from 'react';
// Imported as a URL so the fallback is fetched (and cached) only when an image fails,
// instead of shipping as a 32 KB base64 string in the root JS chunk and in SSR HTML.
import brokenImgSrc from './broken-image.png';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string[];
}

export const ImageBase = ({ src, alt, className, fallbackSrc, ...props }: ImageProps) => {
  // Keep track of errors so we can try the next fallbackSrc.
  const [errorCount, setErrorCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src || brokenImgSrc);

  const handleBrokenImage: DOMAttributes<HTMLImageElement>['onError'] = useCallback(() => {
    // Allow the fallbackSrc to be an array of URLs to try in order.
    if (fallbackSrc && errorCount < fallbackSrc.length) {
      setCurrentSrc(fallbackSrc[errorCount]);
      setErrorCount(errorCount + 1);
    } else {
      setCurrentSrc(brokenImgSrc);
    }
  }, [fallbackSrc, errorCount, setCurrentSrc, setErrorCount]);

  return <img {...props} src={currentSrc} alt={alt} className={className} onError={handleBrokenImage} />;
};

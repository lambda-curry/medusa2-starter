import { DOMAttributes, useCallback, useState } from 'react';
import { ImageProxyURLOptions, useImageProxySrc } from '../../../utils/img-proxy';
import { brokenImgSrc } from './brokenImgSrc';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string[];
  proxyOptions?: ImageProxyURLOptions;
}

export const ImageBase = ({ src, alt, className, fallbackSrc, proxyOptions, ...props }: ImageProps) => {
  // Keep track of errors so we can try the next fallbackSrc.
  const [errorCount, setErrorCount] = useState(0);
  const [currentSrc, setCurrentSrc] = useState(src || brokenImgSrc);
  const proxySrc = useImageProxySrc(currentSrc, proxyOptions);

  const handleBrokenImage: DOMAttributes<HTMLImageElement>['onError'] = useCallback(() => {
    // Allow the fallbackSrc to be an array of URLs to try in order.
    if (fallbackSrc && errorCount < fallbackSrc.length) {
      setCurrentSrc(fallbackSrc[errorCount]);
      setErrorCount(errorCount + 1);
    } else {
      setCurrentSrc(brokenImgSrc);
    }
  }, [fallbackSrc, errorCount, setCurrentSrc, setErrorCount]);

  return <img {...props} src={proxySrc} alt={alt} className={className} onError={handleBrokenImage} />;
};

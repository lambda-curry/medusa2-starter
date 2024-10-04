import { FC, ImgHTMLAttributes } from 'react';
import clsx from 'clsx';
import { ImageProxyURLOptions, useImageProxySrc } from '../../../utils/img-proxy';
import { ImageBase } from './ImageBase';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  sources?: { src: string; media?: string; proxyOptions?: ImageProxyURLOptions }[];
  alt?: string;
  fallbackSrc?: string[];
  proxyOptions?: ImageProxyURLOptions;
}

export const Source = ({
  src,
  media,
  proxyOptions
}: {
  src: string;
  media?: string;
  proxyOptions?: ImageProxyURLOptions;
}) => {
  const proxySrc = useImageProxySrc(src, proxyOptions);
  return <source media={media} srcSet={proxySrc} />;
};

export const Image: FC<ImageProps> = ({ src, sources, className, ...rest }) => {
  if (!src && !sources?.length) return null;

  const defaultSrc = src || (sources && sources[sources.length - 1].src);

  return (
    <picture>
      {sources?.map(({ src, media, proxyOptions }) =>
        src && src !== defaultSrc ? <Source key={src} src={src} media={media} proxyOptions={proxyOptions} /> : null
      )}
      <ImageBase className={clsx(`mkt-image`, className)} src={defaultSrc} {...rest} />
    </picture>
  );
};

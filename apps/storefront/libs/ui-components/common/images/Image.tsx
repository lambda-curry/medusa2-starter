import { FC, ImgHTMLAttributes } from 'react';
import clsx from 'clsx';
import { ImageBase } from './ImageBase';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  sources?: {
    src: string;
    media?: string;
  }[];
  alt?: string;
  fallbackSrc?: string[];
}

export const Source = ({
  src,
  media,
}: {
  src: string;
  media?: string;
}) => {
  return <source media={media} src={src} />;
};

export const Image: FC<ImageProps> = ({ src, sources, className, ...rest }) => {
  if (!src && !sources?.length) return null;

  const defaultSrc = src || (sources && sources[sources.length - 1].src);

  return (
    <picture>
      {sources?.map(({ src, media }) =>
        src && src !== defaultSrc ? <Source key={src} src={src} media={media} /> : null,
      )}
      <ImageBase className={clsx(`mkt-image`, className)} src={defaultSrc} {...rest} />
    </picture>
  );
};

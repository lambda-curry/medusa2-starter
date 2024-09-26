import { FC, HTMLAttributes, useEffect } from 'react';
import { Image } from '@components/images/Image';
import clsx from 'clsx';
import { useFetcher } from '@remix-run/react';
import type { Video } from '@libs/util/index';

export interface BackgroundVideoThumbnailProps
  extends HTMLAttributes<HTMLDivElement> {
  url: Video['url'];
  thumbnail?: Video['thumbnail'];
}

export const BackgroundVideoThumbnail: FC<BackgroundVideoThumbnailProps> = ({
  url: videoURL,
  thumbnail: customThumbnail,
  className,
  ...props
}) => {
  const oembedFetcher = useFetcher<{
    thumbnail_url: string;
    provider_name: string;
  }>();
  const thumbnailURL =
    customThumbnail?.url || oembedFetcher.data?.thumbnail_url;

  let src = thumbnailURL;
  let fallbackSrc = undefined;

  useEffect(() => {
    if (videoURL && !customThumbnail?.url)
      oembedFetcher.load(`/api/oembed?url=${encodeURI(videoURL)}`);
  }, [videoURL]);

  if (!thumbnailURL) return null;

  if (
    !customThumbnail?.url &&
    oembedFetcher.data?.provider_name === 'YouTube'
  ) {
    // If the thumbnail is from YouTube, we can try to get a higher quality image
    // by replacing the `hqdefault` in the URL with `maxresdefault`.
    // If the video doesn't have a `maxresdefault` thumbnail, it will fallback to the `hqdefault` thumbnail.
    src = thumbnailURL?.replace('hqdefault', 'maxresdefault');
    fallbackSrc = [thumbnailURL];
  }

  return (
    <div
      {...props}
      className={clsx(
        `mkt-background-video__thumbnail absolute left-0 top-0 z-[2] h-full w-full bg-black transition-opacity duration-300`,
        className
      )}
    >
      <Image
        proxyOptions={{
          context: 'post_header',
        }}
        aria-hidden={true}
        role="presentation"
        alt={
          customThumbnail
            ? customThumbnail.alt?.value || ''
            : 'cover for background video'
        }
        src={src}
        fallbackSrc={fallbackSrc}
        className="mkt-background-video__thumbnail__image h-full w-full object-cover"
      />
    </div>
  );
};

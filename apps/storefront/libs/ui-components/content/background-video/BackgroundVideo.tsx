import { FC, HTMLAttributes, Suspense, lazy, useEffect, useState } from 'react';
import clsx from 'clsx';
import type { OnProgressProps } from 'react-player/base';
import { BackgroundVideoThumbnail } from './BackgroundVideoThumbnail';
import { Video } from '@libs/types';
import type ReactPlayer from 'react-player';
import { useHydrated } from 'remix-utils/use-hydrated';

const BackgroundVideoPlayer = lazy(() => import('./BackgroundVideoPlayer'));

export interface BackgroundVideoProps extends HTMLAttributes<HTMLDivElement> {
  url?: Video['url'];
  thumbnail?: Video['thumbnail'];
}

export const BackgroundVideo: FC<BackgroundVideoProps> = ({ url, thumbnail, className }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isHydrated = useHydrated();

  const onProgress = ({ loaded }: OnProgressProps) => {
    if (!isPlaying && loaded) setIsPlaying(true);
  };

  const onReady = (player: ReactPlayer) => {
    const internalPlayer = player.getInternalPlayer();

    if (internalPlayer.hasOwnProperty('playVideo')) {
      // NOTE: This is just for YouTube. We have to manually call the `playVideo` method on the YouTube internal player
      // to get it to autoplay on mobile, as the config alone is not enough.
      internalPlayer['playVideo']();
    }
  };

  useEffect(() => {
    // NOTE: Reset the isPlaying state when the URL changes so the video thumbnail is shown while the new video loads.
    if (isPlaying) setIsPlaying(false);
  }, [url]);

  if (!isHydrated)
    return (
      <div
        key={url}
        className={clsx(
          `mkt-background-video pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden`,
          className,
        )}
      >
        <BackgroundVideoThumbnail
          url={url}
          thumbnail={thumbnail}
          className={clsx('transition-opacity duration-500', {
            'opacity-100': !isPlaying,
            'opacity-0': isPlaying,
          })}
        />
      </div>
    );

  return (
    <div
      // NOTE: Set the key to the video URL so that the component is re-mounted when the URL changes.
      // This assists with the video player not playing the new video when the URL changes.
      // This is particularly useful for the live preview in the CMS.
      key={url}
      className={clsx(
        `mkt-background-video pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden`,
        className,
      )}
    >
      <BackgroundVideoThumbnail
        url={url}
        thumbnail={thumbnail}
        className={clsx('transition-opacity duration-500', {
          'opacity-100': !isPlaying,
          'opacity-0': isPlaying,
        })}
      />
      <Suspense fallback={<BackgroundVideoThumbnail url={url} thumbnail={thumbnail} />}>
        <BackgroundVideoPlayer url={url} onReady={onReady} onProgress={onProgress} />
      </Suspense>
    </div>
  );
};

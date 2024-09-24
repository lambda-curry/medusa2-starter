import clsx from 'clsx';
import { FC, Suspense, memo } from 'react';
import ReactPlayer, { ReactPlayerProps } from 'react-player';

export interface BackgroundVideoPlayerProps extends ReactPlayerProps {
  className?: string;
}

// NOTE: We need to memoize the player component to prevent it from re-loading on every state change.
export const BackgroundVideoPlayer: FC<BackgroundVideoPlayerProps> = memo(({ url, className, ...props }) => (
  <div
    className={clsx(
      'mkt-background-video__player z-1 [&_iframe]:absolute [&_iframe]:left-1/2 [&_iframe]:top-1/2 [&_iframe]:aspect-video [&_iframe]:!h-auto [&_iframe]:min-h-[calc(100%+112px)] [&_iframe]:!w-auto [&_iframe]:min-w-full [&_iframe]:-translate-x-1/2 [&_iframe]:-translate-y-1/2',
      className
    )}
  >
    <Suspense>
      <ReactPlayer
        {...props}
        url={url}
        loop={true}
        muted={true}
        controls={false}
        config={{
          youtube: {
            playerVars: {
              // NOTE: For some reason, the player doesn't play the video if we don't specifically set YouTube's autoplay parameter,
              // even though we set the autoplay prop to `true`.
              autoplay: 1,
              mute: 1,
              loop: 1,
              controls: 0,
              disablekb: 1,
              enablejsapi: 1,
              modestbranding: 1,
              fs: 0,
              rel: 0
            }
          },
          vimeo: {
            playerOptions: {
              background: 1,
              autoplay: 1,
              muted: 1,
              loop: 1,
              controls: 0,
              playsinline: 1
            }
          }
        }}
      />
    </Suspense>
  </div>
));

export default BackgroundVideoPlayer;

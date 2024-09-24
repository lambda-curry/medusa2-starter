import { FC, HTMLAttributes, useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { BackgroundType, PostSection } from '@marketplace/util/medusa/types';
import { BackgroundVideo } from '../../background-video/BackgroundVideo';
import mergeWith from 'lodash/mergeWith';

export interface PostSectionBackgroundVideoProps extends HTMLAttributes<HTMLElement> {
  section: PostSection;
}

export const PostSectionBackgroundVideo: FC<PostSectionBackgroundVideoProps> = ({ section, className, ...props }) => {
  const { styles } = section;

  const defaultStyles = styles?.default || {};
  const mobileStyles = styles?.mobile || {};

  const defaultBackgroundType = defaultStyles?.background_type;
  const mobileBackgroundType = mobileStyles?.background_type || defaultBackgroundType;

  const defaultVideoURL = defaultStyles.background_video?.url || '';
  const mobileVideoURL =
    mobileStyles?.background_type === BackgroundType.VIDEO ? mobileStyles.background_video?.url || '' : '';

  const defaultVideoThumbnail = defaultStyles.background_video?.thumbnail;
  const mobileVideoThumbnail =
    mobileStyles?.background_type === BackgroundType.VIDEO
      ? mergeWith({}, defaultVideoThumbnail, mobileStyles.background_video?.thumbnail, (a, b) =>
          b === null ? a : undefined
        )
      : defaultVideoThumbnail;

  const hasDefaultVideo = defaultBackgroundType === BackgroundType.VIDEO && defaultVideoURL;
  const hasMobileVideo = mobileBackgroundType === BackgroundType.VIDEO && mobileVideoURL;

  const hasVideo = hasDefaultVideo || hasMobileVideo;

  if (!hasVideo) return null;

  return (
    <div
      className={clsx('mkt-post-section__background-video absolute left-0 top-0 h-full w-full', className)}
      {...props}
    >
      {hasMobileVideo && (
        <BackgroundVideo className="block sm:hidden" url={mobileVideoURL} thumbnail={mobileVideoThumbnail} />
      )}
      <BackgroundVideo
        className={clsx({ 'hidden sm:block': hasMobileVideo })}
        url={defaultVideoURL}
        thumbnail={defaultVideoThumbnail}
      />
    </div>
  );
};

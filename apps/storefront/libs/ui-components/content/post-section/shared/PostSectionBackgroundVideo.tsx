import { FC, HTMLAttributes, useRef, useState, useEffect } from "react"
import clsx from "clsx"
import {
  BackgroundType,
  BaseStyles,
  ThumbnailImage,
} from "@libs/util/medusa/types"
import { BackgroundVideo } from "../../background-video/BackgroundVideo"

export interface SectionBackgroundVideoProps
  extends HTMLAttributes<HTMLElement> {
  backgroundType: BackgroundType
  videoURL: string | undefined
  thumbnail: ThumbnailImage | undefined
}

export const SectionBackgroundVideo: FC<SectionBackgroundVideoProps> = ({
  className,
  backgroundType,
  videoURL = "",
  thumbnail,
  ...props
}) => {
  const hasVideo = backgroundType === BackgroundType.VIDEO && !!videoURL

  if (!hasVideo) return null

  return (
    <div
      className={clsx(
        "mkt-section__background-video absolute left-0 top-0 h-full w-full",
        className,
      )}
      {...props}
    >
      <BackgroundVideo url={videoURL} thumbnail={thumbnail} />
    </div>
  )
}

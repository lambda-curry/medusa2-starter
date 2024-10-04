import { FC, HTMLAttributes, useId } from "react"
import clsx from "clsx"
import { HeroContent } from "@libs/util/medusa/types"
import { SectionBackgroundVideo } from "./PostSectionBackgroundVideo"
import { PostSectionBackgroundOverlay } from "./PostSectionBackgroundOverlay"
import { SectionBaseProps } from "./PostSectionBase"

export interface SectionHeroProps extends SectionBaseProps<HeroContent> {}

export const SectionHero: FC<SectionHeroProps> = ({
  data,
  className,
  children,
  ...props
}) => {
  if (!data) return null

  const { backgroundType, videoURL, thumbnail } = data

  return (
    <>
      <section
        className={clsx(
          `mkt-section relative [--default-padding-bottom:4rem] [--default-padding-top:4rem] [--mobile-padding-bottom:3rem]  [--mobile-padding-top:3rem]`,

          className,
        )}
        {...props}
      >
        <SectionBackgroundVideo
          className="z-0"
          backgroundType={backgroundType}
          videoURL={videoURL}
          thumbnail={thumbnail}
        />
        <PostSectionBackgroundOverlay className="z-[1]" />
        <div className="mkt-section__inner relative z-[2]">{children}</div>
      </section>
    </>
  )
}

import { FC, HTMLAttributes } from "react"
import clsx from "clsx"

export interface PostSectionBackgroundOverlayProps
  extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export const PostSectionBackgroundOverlay: FC<
  PostSectionBackgroundOverlayProps
> = ({ className, ...props }) => (
  <div
    {...props}
    className={clsx(`mkt-section__background-overlay`, className)}
  />
)

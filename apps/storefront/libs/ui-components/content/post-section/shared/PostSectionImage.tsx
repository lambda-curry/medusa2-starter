import { FC, ImgHTMLAttributes } from "react"
import clsx from "clsx"
import { ImageField, ResponsiveImageField } from "@libs/util/medusa"
import { Image } from "@ui-components/common/images/Image"

export interface PostSectionImageProps
  extends ImgHTMLAttributes<HTMLImageElement> {
  image: ImageField
}

export const PostSectionImage: FC<PostSectionImageProps> = ({
  image,
  className,
}) => {
  if (!image?.url) return null

  return (
    <Image
      className={clsx(`mkt-section__image`, className)}
      alt={image?.alt?.value || ""}
      sources={[
        {
          src: image?.url,
        },
      ]}
    />
  )
}

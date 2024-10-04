import clsx from "clsx"
import {
  ImageGalleryContent,
  ImageGalleryPageSection,
} from "@libs/util/medusa/types"
import { PostSectionBase, SectionBaseProps } from "./shared/PostSectionBase"
import { type SectionComponent } from "./types"
import { PageHeading } from "../PageHeading"
import { SectionText } from "../SectionText"
import { Container } from "@ui-components/common/container/Container"
import { FC, Suspense, lazy } from "react"
import { LayoutType } from "react-photo-album"

const ImageGallery = lazy(() => import("./shared/ImageGallery"))

export const PostSectionImageGallery: FC<
  SectionBaseProps<ImageGalleryContent>
> = ({ data }) => {
  if (!data) return null

  const { heading, text, gallery, layout, spacing = 20, columns } = data

  const photos =
    gallery?.map((photo) => ({
      src: photo.url || "",
      alt: photo.alt?.value || "",
      width: photo.width || 500,
      height: photo.height || 500,
    })) || []

  const showHeading = heading?.value || (text?.value.blocks || []).length > 0
  const isFullWidth = !!layout?.includes("full-width")

  return (
    <PostSectionBase
      data={data}
      className={clsx(
        `[--default-background-color:white] [--default-text-align:center]`,
        `border-b-gray-200 first:border-b group-first:border-b`,
      )}
    >
      <Container
        className={clsx("grid !max-w-6xl gap-12", {
          "!max-w-full": isFullWidth,
        })}
        style={{
          paddingLeft: isFullWidth ? `${spacing}px` : undefined,
          paddingRight: isFullWidth ? `${spacing}px` : undefined,
        }}
      >
        {showHeading && (
          <div className="grid gap-6">
            {heading?.value && (
              <PageHeading className="w-full">{heading.value}</PageHeading>
            )}
            <SectionText content={text?.value} />
          </div>
        )}
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            <ImageGallery
              images={photos}
              layout={
                (layout?.replace("-full-width", "") as LayoutType) || "masonry"
              }
              spacing={spacing}
              columns={columns}
            />
          </Suspense>
        </div>
      </Container>
    </PostSectionBase>
  )
}

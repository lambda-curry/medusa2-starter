import { FC, useState } from "react"
import PhotoAlbum, {
  LayoutType,
  RenderPhotoProps,
  Photo,
} from "react-photo-album"
import { ImageGalleryPhoto } from "./ImageGalleryPhoto"
import { LightboxGallery } from "@ui-components/common/images/LightboxGallery"

interface Image extends Photo {
  src: string
  alt: string
  width: number
  height: number
}

interface ImageGalleryProps {
  images: Image[]
  layout?: LayoutType
  spacing?: number
  columns?: number
}

const ImageGallery: FC<ImageGalleryProps> = ({
  images,
  layout = "masonry",
  spacing = 20,
  columns = 4,
}) => {
  const [lightBoxIndex, setLightBoxIndex] = useState(-1)

  const photos: Photo[] = images.map((image) => ({
    src: image.src,
    alt: image.alt || "",
    width: image.width || 500,
    height: image.height || 500,
  }))

  const responsiveColumns = (containerWidth: number) => {
    const maxColumns = columns

    if (containerWidth < 400) return 1
    if (containerWidth < 600 && maxColumns > 1) return 2
    if (containerWidth < 800 && maxColumns > 2) return 3
    if (containerWidth < 1000 && maxColumns > 3) return 4

    return maxColumns
  }

  return (
    <>
      <PhotoAlbum
        spacing={typeof spacing === "number" && !isNaN(spacing) ? spacing : 20}
        layout={layout}
        photos={photos}
        columns={responsiveColumns}
        onClick={({ index }) => setLightBoxIndex(index)}
        renderPhoto={(props: RenderPhotoProps<Photo>) => (
          <ImageGalleryPhoto {...props} />
        )}
      />
      <LightboxGallery
        images={photos}
        lightBoxIndex={lightBoxIndex}
        setLightBoxIndex={setLightBoxIndex}
      />
    </>
  )
}

export default ImageGallery

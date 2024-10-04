import { FC } from "react"
import { RenderPhotoProps } from "react-photo-album"
import { ImageBase } from "@ui-components/common/images/ImageBase"
import { MagnifyingGlassPlusIcon } from "@heroicons/react/24/outline"

export const ImageGalleryPhoto: FC<RenderPhotoProps> = ({
  imageProps,
  wrapperStyle,
}) => {
  return (
    <div
      className="group relative cursor-pointer shadow-none transition-all duration-200 hover:z-10 hover:scale-[1.02] hover:shadow-lg"
      style={wrapperStyle}
    >
      <ImageBase
        loading="lazy"
        {...imageProps}
        proxyOptions={{
          context: "image_gallery",
        }}
        className="!mb-0 !h-full !w-full object-cover ease-in-out"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all duration-200 ease-in-out group-hover:bg-opacity-50 group-hover:opacity-100">
        <MagnifyingGlassPlusIcon className="h-8 w-8 text-white" />
      </div>
    </div>
  )
}

import { FC, lazy } from "react"
import SectionProductList, {
  SectionProductListProps,
} from "./shared/PostSectionProductList"
import { ProductCarouselSkeleton } from "@ui-components/product/ProductCarouselSkeleton"

const ProductCarousel = lazy(() => import("../../product/ProductCarousel"))

export const PostSectionProductListCarousel: FC<
  Omit<SectionProductListProps, "component" | "fallback">
> = (props) => {
  return (
    <SectionProductList
      {...props}
      component={ProductCarousel}
      fallback={<ProductCarouselSkeleton length={3} />}
    />
  )
}
export default PostSectionProductListCarousel

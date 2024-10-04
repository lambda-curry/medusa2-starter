import { FC, lazy } from "react"
import SectionProductList, {
  SectionProductListProps,
} from "./shared/PostSectionProductList"
import { ProductGridSkeleton } from "@ui-components/product/ProductGridSkeleton"

const ProductGrid = lazy(() => import("../../product/ProductGrid"))

export const PostSectionProductListGrid: FC<SectionProductListProps> = (
  props,
) => {
  return (
    <SectionProductList
      {...props}
      component={ProductGrid}
      fallback={<ProductGridSkeleton length={3} />}
    />
  )
}

export default PostSectionProductListGrid

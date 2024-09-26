import { FC } from "react"
import ProductReviewSummary from "./ReviewSummary"
import { ProductReviewListWithPagination } from "./ReviewListWithPagination"
import { useRouteLoaderData } from "@remix-run/react"
import { ProductPageLoaderData } from "../../routes/_todo/products.$productHandle"
import { ProductReview } from "@libs/util/medusa"

interface ProductReviewSectionProps {}

export const ProductReviewSection: FC<ProductReviewSectionProps> = () => {
  const data = useRouteLoaderData<ProductPageLoaderData>(
    "routes/products.$productHandle",
  )

  if (!data) return null

  const { product, reviews, limit, offset, count } = data

  if (!product.reviewStats || product.reviewStats.count < 1) return null

  return (
    <section
      id="reviews"
      className="container mx-auto my-12 grid grid-cols-12 px-8"
    >
      <ProductReviewSummary
        className="col-span-12 lg:col-span-4"
        stats={product.reviewStats}
      />

      <ProductReviewListWithPagination
        className="col-span-12 my-16 lg:col-span-8 lg:col-start-6 lg:mt-0"
        productReviews={reviews as ProductReview[]}
        context={`/products/${product.handle}`}
        paginationConfig={{
          limit,
          offset,
          count,
        }}
      />
    </section>
  )
}

import HomeIcon from "@heroicons/react/24/solid/HomeIcon"
import { RenderPageSection } from "@ui-components/content/post-section/PostSection"
import { useCart } from "@ui-components/hooks/useCart"
import { useProductPriceDetails } from "@ui-components/hooks/useProductPriceDetails"
import { useRegion } from "@ui-components/hooks/useRegion"
import { ProductImageGallery } from "@ui-components/product/ProductImageGallery"
import { ProductPrice } from "@ui-components/product/ProductPrice"
import { ProductPriceRange } from "@ui-components/product/ProductPriceRange"
import {
  Breadcrumb,
  Breadcrumbs,
} from "@ui-components/common/breadcrumbs/Breadcrumbs"
import { Button } from "@ui-components/common/buttons/Button"
import { SubmitButton } from "@ui-components/common/buttons/SubmitButton"
import { Container } from "@ui-components/common/container/Container"
import { Form } from "@ui-components/common/forms/Form"
import { FormError } from "@ui-components/common/forms/FormError"
import { FieldGroup } from "@ui-components/common/forms/fields/FieldGroup"
import { FieldTextarea } from "@ui-components/common/forms/fields/FieldTextarea"
import { Grid } from "@ui-components/common/grid/Grid"
import { GridColumn } from "@ui-components/common/grid/GridColumn"
import { Share } from "~/components/share"
import {
  Page,
  BasePageSection,
  PageTemplate,
  PricedProduct,
  PricedVariant,
  ProductOptionValue,
  ProductWithReviews,
} from "@libs/util/medusa/types"
import { Link, useFetcher } from "@remix-run/react"
import { withYup } from "@remix-validated-form/with-yup"
import clsx from "clsx"
import truncate from "lodash/truncate"
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import * as Yup from "yup"
import { ProductOptionSelectorSelect } from "~/components/products/ProductOptionSelectorSelect"
import { LineItemActions } from "~/routes/_todo/api.cart.line-items"
import { PostData } from "~/routes/_todo/api.post-section-data"
import {
  getFilteredOptionValues,
  getOptionValuesWithDiscountLabels,
  selectVariantFromMatrixBySelectedOptions,
  selectVariantMatrix,
} from "@libs/util/products"
import { useProductInventory } from "../../libs/ui-components/hooks/useProductInventory"
import { FieldLabel } from "@ui-components/common/forms/fields/FieldLabel"
import { formatDate } from "../../libs/util/formatters"
import { variantSaleEndDate } from "../../libs/util/prices"
import { ProductOptionSelectorRadio } from "../components/products/ProductOptionSelectorRadio"
import { ProductReviewSection } from "../components/reviews/ProductReviewSection"
import { ProductReviewStars } from "../components/reviews/ProductReviewStars"
import { ImageUploadWithPreview } from "@ui-components/common/ImageUpload/ImageUploadWithPreview"
import { QuantitySelector } from "@ui-components/common/field-groups/QuantitySelector"

export interface AddToCartFormValues {
  productId: string
  quantity?: number
  options: {
    [key: string]: string
  }
  customer_product_response?: string | null
  customer_file_uploads?: string[]
}

export const getAddToCartValidator = (product: PricedProduct) => {
  const optionsValidation = product.options!.reduce((acc, option) => {
    if (!option.id) return acc

    acc[option.id] = Yup.string().required(`${option.title} is required`)

    return acc
  }, {} as { [key: string]: Yup.SchemaOf<string> })

  const schemaShape: Record<keyof AddToCartFormValues, Yup.AnySchema> = {
    productId: Yup.string().required("Product ID is required"),
    quantity: Yup.number().optional(),
    options: Yup.object().shape(optionsValidation),
    customer_product_response: Yup.string().nullable().optional(),
    customer_file_uploads: Yup.mixed().optional(),
  }

  if (product.customer_response_prompt) {
    schemaShape.customer_product_response =
      product.customer_response_prompt_required
        ? Yup.string().required("Response is required")
        : Yup.string().optional()
  }

  return withYup(Yup.object().shape(schemaShape))
}

const getBreadcrumbs = (product: PricedProduct) => {
  const breadcrumbs: Breadcrumb[] = [
    {
      label: (
        <span className="flex whitespace-nowrap">
          <HomeIcon className="inline h-4 w-4" />
          <span className="sr-only">Home</span>
        </span>
      ),
      url: `/`,
    },
    {
      label: "All Products",
      url: "/products",
    },
  ]

  if (product.collection) {
    breadcrumbs.push({
      label: product.collection.title,
      url: `/collections/${product.collection.handle}`,
    })
  }

  return breadcrumbs
}

export const SaleEndsOn = ({ dateSaleEnds }: { dateSaleEnds: Date | null }) => {
  if (!dateSaleEnds) return null

  // calculate days until sale ends from today (rounded up)
  const daysUntilSaleEnds = Math.ceil(
    (dateSaleEnds.getTime() - new Date().getTime()) / (1000 * 3600 * 24),
  )

  if (daysUntilSaleEnds < 0) return null
  if (daysUntilSaleEnds <= 1)
    return <p className="text-sm text-gray-500">Sale ends in today</p>
  if (daysUntilSaleEnds <= 10)
    return (
      <p className="text-sm text-gray-500">
        Sale ends in {daysUntilSaleEnds} days
      </p>
    )
  if (daysUntilSaleEnds > 10)
    return (
      <p className="text-sm text-gray-500">
        Sale ends on {formatDate(dateSaleEnds)}
      </p>
    )

  return null
}

export interface ProductTemplateProps {
  product: ProductWithReviews
  post?: Page | PageTemplate
  isPreview?: boolean
  data?: PostData
}

const variantIsSoldOut: (variant: PricedVariant | undefined) => boolean = (
  variant,
) => {
  return !!(variant?.manage_inventory && variant?.inventory_quantity! < 1)
}

export const ProductTemplate = ({
  product,
  post,
  isPreview,
  data,
}: ProductTemplateProps) => {
  const formRef = useRef<HTMLFormElement>(null)
  const addToCartFetcher = useFetcher<any>()
  const { cart, toggleCartDrawer } = useCart()
  const { region } = useRegion()
  const hasErrors =
    Object.keys(addToCartFetcher.data?.fieldErrors || {}).length > 0
  const isSubmitting = ["submitting", "loading"].includes(
    addToCartFetcher.state,
  )
  const productPriceDetails = useProductPriceDetails(product)
  const validator = getAddToCartValidator(product)

  const defaultValues: AddToCartFormValues = {
    productId: product.id!,
    quantity: 1,
    options: {},
    customer_product_response: null,
    customer_file_uploads: [],
  }

  const breadcrumbs = getBreadcrumbs(product)
  const currencyCode = region.currency_code
  const [controlledOptions, setControlledOptions] = useState<
    Record<string, string>
  >(defaultValues.options)
  const selectedOptions = useMemo(
    () => product.options?.map(({ id }) => controlledOptions[id]),
    [product, controlledOptions],
  )

  const variantMatrix = useMemo(() => selectVariantMatrix(product), [product])
  const selectedVariant = useMemo(
    () =>
      selectVariantFromMatrixBySelectedOptions(variantMatrix, selectedOptions),
    [variantMatrix, selectedOptions],
  )

  const productSelectOptions = useMemo(
    () =>
      product.options?.map((option, index) => {
        const filteredOptionValues = getFilteredOptionValues(
          product,
          controlledOptions,
          option.id,
        )
        const optionValues = option.values as unknown as (ProductOptionValue & {
          disabled?: boolean
        })[]

        optionValues.forEach((optionValue) => {
          if (
            !filteredOptionValues.find(
              (filteredOptionValue) =>
                optionValue.value === filteredOptionValue.value,
            )
          ) {
            ;(optionValue as any).disabled = true
          } else {
            ;(optionValue as any).disabled = false
          }
        })

        const optionValuesWithLabels = getOptionValuesWithDiscountLabels(
          index,
          currencyCode,
          optionValues,
          variantMatrix,
          selectedOptions,
        )
        return {
          title: option.title,
          product_id: option.product_id,
          id: option.id,
          values: optionValuesWithLabels.map(({ value, label }) => ({
            value,
            label,
          })),
        }
      }),
    [product, controlledOptions],
  )

  const productSoldOut = useProductInventory(product).averageInventory === 0

  const handleOptionChangeBySelect = (e: ChangeEvent<HTMLInputElement>) => {
    setControlledOptions({
      ...controlledOptions,
      [e.target.name.replace("options.", "")]: e.target.value,
    })
  }

  const handleOptionChangeByRadio = (name: string, value: string) => {
    setControlledOptions({
      ...controlledOptions,
      [name]: value,
    })
  }

  useEffect(() => {
    if (!isSubmitting && !hasErrors) {
      formRef.current?.reset()
    }
  }, [isSubmitting, hasErrors])

  const soldOut = variantIsSoldOut(selectedVariant) || productSoldOut
  const hasSections = !!post?.sections.length
  const selectedVariantSaleEndDate = selectedVariant
    ? variantSaleEndDate(selectedVariant, currencyCode)
    : null

  return (
    <>
      <section
        className={clsx("bg-white pb-12 sm:pt-6", {
          "min-h-screen": !hasSections,
        })}
      >
        <Form<AddToCartFormValues, LineItemActions.CREATE>
          id="addToCartForm"
          formRef={formRef}
          fetcher={addToCartFetcher}
          encType="multipart/form-data"
          method="post"
          action={`/api/cart/line-items`}
          subaction={LineItemActions.CREATE}
          defaultValues={defaultValues}
          validator={validator}
          onSubmit={() => {
            toggleCartDrawer(true)
          }}
        >
          <input type="hidden" name="productId" value={product.id} />

          <Container className="px-0 sm:px-6 md:px-8">
            <Grid>
              <GridColumn>
                <div className="md:py-6">
                  <Grid className="!gap-0">
                    <GridColumn className="mb-8 md:col-span-6 lg:col-span-7">
                      <ProductImageGallery product={product} />
                    </GridColumn>

                    <GridColumn className="flex flex-col md:col-span-6 lg:col-span-5">
                      <div className="px-0 sm:px-6 md:p-10 md:pt-0">
                        <div>
                          <Breadcrumbs
                            className="mb-6"
                            breadcrumbs={breadcrumbs}
                          />

                          <header className="flex gap-4">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:tracking-tight">
                              {product.title}
                            </h1>
                            <div className="flex-1" />
                            <Share
                              itemType="product"
                              shareData={{
                                title: product.title,
                                text: truncate(
                                  product.description || post?.seo?.description,
                                  {
                                    length: 200,
                                    separator: " ",
                                  },
                                ),
                              }}
                            />
                          </header>
                          <p className="my-1 text-sm text-gray-500">
                            by{" "}
                            <Link
                              to={`/vendors/${product.vendor!.handle}`}
                              className="hover:text-gray-700 hover:underline"
                            >
                              {product.vendor!.name}
                            </Link>
                          </p>
                        </div>

                        <ProductReviewStars reviewStats={product.reviewStats} />

                        <section
                          aria-labelledby="product-information"
                          className="mt-4"
                        >
                          <h2 id="product-information" className="sr-only">
                            Product information
                          </h2>

                          <SaleEndsOn
                            dateSaleEnds={selectedVariantSaleEndDate}
                          />
                          <p className="text-lg text-gray-900 sm:text-xl">
                            {/* TODO: Should show price based on product variant selected and show "compare at" price if there is a discount active */}
                            {selectedVariant ? (
                              <ProductPrice
                                product={product}
                                variant={selectedVariant}
                                currencyCode={currencyCode}
                              />
                            ) : (
                              <ProductPriceRange
                                product={product}
                                currencyCode={currencyCode}
                              />
                            )}
                          </p>
                        </section>

                        {productSelectOptions &&
                          productSelectOptions.length > 5 && (
                            <section
                              aria-labelledby="product-options"
                              className="product-options"
                            >
                              <h2 id="product-options" className="sr-only">
                                Product options
                              </h2>

                              <FieldGroup>
                                {productSelectOptions.map(
                                  (option, optionIndex) => (
                                    <ProductOptionSelectorSelect
                                      key={optionIndex}
                                      option={option}
                                      value={controlledOptions[option.id]}
                                      onChange={handleOptionChangeBySelect}
                                    />
                                  ),
                                )}
                              </FieldGroup>
                            </section>
                          )}

                        {productSelectOptions &&
                          productSelectOptions.length <= 5 && (
                            <section
                              aria-labelledby="product-options"
                              className="product-options my-6 grid gap-4"
                            >
                              <h2 id="product-options" className="sr-only">
                                Product options
                              </h2>
                              {productSelectOptions.map(
                                (option, optionIndex) => (
                                  <div key={optionIndex}>
                                    <FieldLabel className="mb-2">
                                      {option.title}
                                    </FieldLabel>
                                    <ProductOptionSelectorRadio
                                      option={option}
                                      value={controlledOptions[option.id]}
                                      onChange={handleOptionChangeByRadio}
                                    />
                                  </div>
                                ),
                              )}
                            </section>
                          )}

                        <FormError />

                        <div className="my-2 flex flex-col gap-2">
                          {product.customer_response_prompt && (
                            <FieldTextarea
                              name="customer_product_response"
                              label={product.customer_response_prompt}
                              placeholder="Enter your response here..."
                            />
                          )}

                          {product.customer_file_uploads_enabled && (
                            <ImageUploadWithPreview
                              className="mt-4"
                              name="customer_file_uploads"
                            />
                          )}

                          <div className="flex items-center gap-4 py-2">
                            {!soldOut && (
                              <QuantitySelector variant={selectedVariant} />
                            )}
                            <div className="flex-1">
                              {!soldOut ? (
                                <SubmitButton className="!h-12 w-full whitespace-nowrap !text-base !font-bold">
                                  {isSubmitting ? "Adding..." : "Add to cart"}
                                </SubmitButton>
                              ) : (
                                <SubmitButton
                                  disabled
                                  className="pointer-events-none !h-12 w-full !text-base !font-bold opacity-50"
                                >
                                  Sold out
                                </SubmitButton>
                              )}
                            </div>
                          </div>

                          {!!product.description && (
                            <div className="mt-4">
                              <h3 className="mb-2">Description</h3>
                              <div
                                className="whitespace-pre-wrap text-base text-gray-500"
                                dangerouslySetInnerHTML={{
                                  __html: product.description || "",
                                }}
                              />
                            </div>
                          )}

                          {product.categories && product.categories.length > 0 && (
                            <nav aria-label="Categories" className="mt-4">
                              <h3 className="mb-2">Categories</h3>

                              <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {product.categories.map(
                                  (category, categoryIndex) => (
                                    <li key={categoryIndex}>
                                      <Button
                                        as={(buttonProps) => (
                                          <Link
                                            to={`/categories/${category.handle}`}
                                            {...buttonProps}
                                          />
                                        )}
                                        className="!h-auto whitespace-nowrap !rounded !px-2 !py-1 !text-xs !font-bold"
                                      >
                                        {category.name}
                                      </Button>
                                    </li>
                                  ),
                                )}
                              </ol>
                            </nav>
                          )}

                          {product.tags && product.tags.length > 0 && (
                            <nav aria-label="Tags" className="mt-4">
                              <h3 className="mb-2">Tags</h3>

                              <ol className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                {product.tags.map((tag, tagIndex) => (
                                  <li key={tagIndex}>
                                    <Button
                                      as={(buttonProps) => (
                                        <Link
                                          to={`/products/tags/${tag.value}/${tag.id}`}
                                          {...buttonProps}
                                        />
                                      )}
                                      className="!h-auto whitespace-nowrap !rounded !px-2 !py-1 !text-xs !font-bold"
                                    >
                                      {tag.value}
                                    </Button>
                                  </li>
                                ))}
                              </ol>
                            </nav>
                          )}
                        </div>
                      </div>
                    </GridColumn>
                  </Grid>
                </div>
              </GridColumn>
            </Grid>
          </Container>
        </Form>{" "}
      </section>

      {hasSections && (
        <>
          {post.sections.map((section, index) => (
            <RenderPageSection
              key={`${section.id}_${index}`}
              section={section as BasePageSection}
              isPreview={isPreview}
              data={data?.[section.id]}
            />
          ))}
        </>
      )}
      <ProductReviewSection />
    </>
  )
}

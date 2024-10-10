import { type FC, useState } from "react"
import EnvelopeIcon from "@heroicons/react/24/outline/EnvelopeIcon"
import ArrowUturnLeftIcon from "@heroicons/react/24/outline/ArrowUturnLeftIcon"
import CalendarIcon from "@heroicons/react/24/outline/CalendarIcon"
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon"
import type {
  Page,
  BasePageSection,
  PageTemplate,
  ProductWithReviews,
  Vendor,
} from "@libs/util/medusa/types"
import { Container } from "@ui-components/common/container/Container"
import { Image } from "@ui-components/common/images/Image"
import { Button } from "@ui-components/common/buttons/Button"
import { RenderPageSection } from "@ui-components/content/post-section/PostSection"
import { ProductListWithPagination } from "~/components/products/ProductListWithPagination"
import { VendorContactFormModal } from "~/components/vendor/VendorContactFormModal/VendorContactFormModal"
import type { PostData } from "~/routes/api.post-section-data"
import { Modal } from "@ui-components/common/modals"

export interface VendorTemplateProps {
  vendor: Vendor
  post?: Page | PageTemplate
  products?: ProductWithReviews[]
  isPreview?: boolean
  data?: PostData
}

export const VendorTemplate: FC<VendorTemplateProps> = ({
  vendor,
  post,
  products,
  isPreview,
  data,
}) => {
  const [returnPolicyModalOpen, setReturnPolicyModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)

  const memberSince = new Date(vendor.created_at as string).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
    },
  )
  const hasSections = !!post?.sections.length

  return (
    <>
      <section>
        <Container className="mt-6">
          <div className="grid grid-cols-12 items-start gap-4 sm:gap-6 md:gap-8 xl:gap-10">
            <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-6">
              <div className="flex flex-col items-center gap-4 text-center md:gap-6 lg:flex-row lg:gap-8 lg:text-left">
                {vendor.logo && (
                  <div className="flex-shrink-0">
                    <Image
                      className="h-20 w-20 rounded-lg border border-gray-200 bg-white object-contain p-2 sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-36 lg:w-36"
                      src={vendor.logo.url}
                      alt={`Logo for ${vendor.name}`}
                    />
                  </div>
                )}

                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl sm:tracking-tight">
                    {vendor.name}
                  </h1>

                  <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-gray-500 lg:justify-start">
                    {vendor.location && (
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="inline-block h-4 w-4" />
                        <span>{vendor.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <CalendarIcon className="inline-block h-4 w-4" />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 text-center md:col-span-10 md:col-start-2 lg:col-span-5 lg:col-start-7 lg:text-left">
              {vendor.description && (
                <dl>
                  <dt className="hidden text-sm font-bold text-gray-500 lg:block">
                    About us
                  </dt>
                  <dd
                    className="mt-2 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: vendor.description }}
                  />
                </dl>
              )}
              {(vendor.email || vendor.return_policy) && (
                <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {vendor.email && (
                    <div>
                      <Button
                        size="sm"
                        onClick={() => setContactModalOpen(true)}
                        className="inline-flex items-center gap-2"
                      >
                        <EnvelopeIcon className="inline-block h-4 w-4" />
                        <span>Contact vendor</span>
                      </Button>
                    </div>
                  )}

                  {vendor.return_policy && (
                    <div>
                      <Button
                        size="sm"
                        className="inline-flex items-center gap-2"
                        onClick={() => setReturnPolicyModalOpen(true)}
                      >
                        <ArrowUturnLeftIcon className="inline-block h-4 w-4" />
                        <span>Return policy</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <hr className="mt-8" />
        </Container>
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

      <Container className="my-12">
        <ProductListWithPagination
          products={products}
          context={`vendors/${vendor.handle}`}
        />
      </Container>

      {vendor.email && (
        <VendorContactFormModal
          vendor={vendor}
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
        />
      )}

      {vendor.return_policy && (
        <Modal
          isOpen={returnPolicyModalOpen}
          onClose={() => setReturnPolicyModalOpen(false)}
        >
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            Return &amp; Refund policy
          </h2>
          <div dangerouslySetInnerHTML={{ __html: vendor.return_policy }} />
        </Modal>
      )}
    </>
  )
}

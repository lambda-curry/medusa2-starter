import { PageSectionType } from "@libs/util/medusa/types"

export const getSectionTypeLabel = (type: PageSectionType) => {
  const labels: { [key: string]: string } = {
    [PageSectionType.BUTTON_LIST]: "Button List",
    [PageSectionType.CTA]: "Call to Action",
    [PageSectionType.HEADER]: "Header",
    [PageSectionType.HERO]: "Hero",
    [PageSectionType.PRODUCT_CAROUSEL]: "Product Carousel",
    [PageSectionType.PRODUCT_GRID]: "Product Grid",
    [PageSectionType.RAW_HTML]: "Raw HTML",
    [PageSectionType.RICH_TEXT]: "Rich Text",
    [PageSectionType.BLOG_LIST]: "Blog List",
  }

  return labels[type] ?? ""
}

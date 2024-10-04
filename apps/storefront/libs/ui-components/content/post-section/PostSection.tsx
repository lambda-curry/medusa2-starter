import {
  BasePageSectionContent,
  BasePageSection,
  PageSectionStatus,
  PageSectionType,
  PageSection,
} from "@libs/util/medusa/types"
import { type SectionComponent } from "./types"
import PostSectionButtonList from "./PostSectionButtonList"
import PostSectionCTA from "./PostSectionCTA"
import PostSectionHeader from "./PostSectionHeader"
import PostSectionHero from "./PostSectionHero"
import PostSectionRawHTML from "./PostSectionRawHTML"
import PostSectionRichText from "./PostSectionRichText"
import PostSectionProductListCarousel from "./PostSectionProductListCarousel"
import PostSectionProductListGrid from "./PostSectionProductListGrid"
import { PostSectionImageGallery } from "./PostSectionImageGallery"
// import PostSectionBlogList from "./PostSectionBlogList"
import { SectionBaseProps } from "./shared/PostSectionBase"
import { FC } from "react"

const COMPONENT_MAP = {
  [PageSectionType.BUTTON_LIST]: PostSectionButtonList,
  [PageSectionType.CTA]: PostSectionCTA,
  [PageSectionType.HEADER]: PostSectionHeader,
  [PageSectionType.HERO]: PostSectionHero,
  [PageSectionType.RAW_HTML]: PostSectionRawHTML,
  [PageSectionType.RICH_TEXT]: PostSectionRichText,
  [PageSectionType.PRODUCT_CAROUSEL]: PostSectionProductListCarousel,
  [PageSectionType.PRODUCT_GRID]: PostSectionProductListGrid,
  [PageSectionType.IMAGE_GALLERY]: PostSectionImageGallery,
  // [PageSectionType.BLOG_LIST]: PostSectionBlogList,
} as unknown as Partial<Record<PageSectionType, FC<SectionBaseProps>>> // TODO: REMOVE this casting ^

// Add types to the props
interface SectionSelectorProps {
  section: PageSection
}

const SectionSelector: React.FC<SectionSelectorProps> = ({
  section,
  ...props
}) => {
  const Component = COMPONENT_MAP[section.type]

  if (!Component) return null

  return <Component {...props} data={section.content} />
}

export const RenderPageSection: SectionComponent = ({ section }) => {
  console.log("🚀 ~ RenderPageSection ~ section:", section?.type)

  if (!section) return null

  // TODO: Remove this
  if ([PageSectionType.BLOG_LIST].includes(section.type)) {
    return null
  }

  return <SectionSelector section={section as PageSection} />
}

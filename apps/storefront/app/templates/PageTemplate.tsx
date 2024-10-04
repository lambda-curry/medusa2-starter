import { RenderPageSection } from "@ui-components/content/post-section"
import {
  Page,
  BasePageSection,
  PageTemplate as PageTemplateType,
} from "@libs/util/medusa/types"
import { FC, PropsWithChildren } from "react"
import { HeroSection } from "@ui-components/content/sections/HeroSection"

export interface PageTemplateProps {
  page: Page | PageTemplateType
  isPreview?: boolean
}

export const PageTemplate: FC<PropsWithChildren<PageTemplateProps>> = ({
  page,
}) => {
  if (!page) return null

  return (
    <>
      {page.sections.map((section, index) => (
        <RenderPageSection
          key={`section-${index}`} // TODO: ADD SECTION ID TO RENDER PAGE SECTION
          section={section as BasePageSection}
        />
      ))}
    </>
  )
}

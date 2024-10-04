import { FC, PropsWithChildren } from "react"
import {
  BasePageSection,
  BasePageSectionContent,
  PageSection,
} from "@libs/util/medusa/types"

export type SectionComponent = FC<PropsWithChildren<{ section: PageSection }>>

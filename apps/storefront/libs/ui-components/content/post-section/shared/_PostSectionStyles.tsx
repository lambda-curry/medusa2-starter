import { FC } from "react"
import { BasePageSection } from "@libs/util/medusa/types"
import { generateSectionStyles } from "../helpers/styles"

export interface PostSectionStylesProps {
  section: BasePageSection
}

export const PostSectionStyles: FC<PostSectionStylesProps> = ({ section }) => {
  const { styles } = generateSectionStyles(section)
  // Note: styles must be applied with dangerouslySetInnerHTML to avoid hydration mismatch errors some odd reason
  return <style type="text/css" dangerouslySetInnerHTML={{ __html: styles }} />
}

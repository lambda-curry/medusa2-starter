import {
  RawHTMLContent,
  type RawHTMLPageSection,
} from "@libs/util/medusa/types"
import { InnerHtml } from "../../../../app/components/html/InnerHTML"
import { type SectionComponent } from "./types"
import { PostSectionBase, SectionBaseProps } from "./shared/PostSectionBase"
import { FC } from "react"

export const PostSectionRawHTML: FC<SectionBaseProps<RawHTMLContent>> = ({
  data,
}) => {
  if (!data) return null

  const { html } = data

  return (
    <PostSectionBase data={data}>
      <InnerHtml className="raw" html={html?.value} />
    </PostSectionBase>
  )
}

export default PostSectionRawHTML

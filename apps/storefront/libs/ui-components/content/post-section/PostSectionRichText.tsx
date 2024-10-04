import { RichTextContent } from "../rich-text-content/RichTextContent"
import { Container } from "@ui-components/common/container/Container"
import { PostSectionBase, SectionBaseProps } from "./shared/PostSectionBase"
import { RichTextContent as RichTextContentType } from "@libs/util/medusa/types"
import { FC } from "react"

export const PostSectionRichText: FC<SectionBaseProps<RichTextContentType>> = ({
  data,
}) => {
  if (!data) return null

  const { text } = data

  return (
    <PostSectionBase data={data}>
      <Container className="!max-w-4xl">
        {text && <RichTextContent content={text.value} />}
      </Container>
    </PostSectionBase>
  )
}

export default PostSectionRichText

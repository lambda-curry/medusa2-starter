import { FC, HTMLAttributes } from "react"
import { type RichTextContentValue } from "@libs/util/medusa/types"
import { RichTextContent } from "./rich-text-content/RichTextContent"

export interface SectionTextProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  content?: RichTextContentValue
}

export const SectionText: FC<SectionTextProps> = ({
  className,
  content,
  ...props
}) => {
  console.log("🚀 ~ SectionText ~ content:", content)
  if (!content?.blocks?.length) return null

  return (
    <div className={className} {...props}>
      <RichTextContent content={content} />
    </div>
  )
}

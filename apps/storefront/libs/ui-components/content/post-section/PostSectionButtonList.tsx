import { FC } from "react"
import { PostSectionBase, SectionBaseProps } from "./shared/PostSectionBase"
import { ActionList } from "../ActionList"
import { SectionHeading } from "../SectionHeading"
import { SectionText } from "../SectionText"
import { Container } from "@ui-components/common/container/Container"

export const PostSectionButtonList: FC<SectionBaseProps> = ({ data }) => {
  if (!data) return null

  const { heading, text, actions } = data

  return (
    <PostSectionBase className="[--default-text-align:center]" data={data}>
      <Container>
        {(heading || text) && (
          <header className="mb-4 md:mb-6 lg:mb-8">
            <div className="inline-block max-w-prose">
              {heading && <SectionHeading>{heading.value}</SectionHeading>}
              {text && <SectionText content={text.value} />}
            </div>
          </header>
        )}

        {!!actions?.length && (
          <div className="mt-8">
            <ActionList actions={actions} className="inline-flex" />
          </div>
        )}
      </Container>
    </PostSectionBase>
  )
}

export default PostSectionButtonList

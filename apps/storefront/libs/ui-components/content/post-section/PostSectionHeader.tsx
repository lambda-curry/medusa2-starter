import clsx from "clsx"
import {
  BasePageSectionContent,
  type HeaderPageSection,
} from "@libs/util/medusa/types"
import { PostSectionBase, SectionBaseProps } from "./shared/PostSectionBase"
import { type SectionComponent } from "./types"
import { PageHeading } from "../PageHeading"
import { SectionText } from "../SectionText"
import { ActionList } from "../ActionList"
import { Container } from "@ui-components/common/container/Container"
import { FC } from "react"

export const PostSectionHeader: FC<SectionBaseProps> = ({ data }) => {
  if (!data) return null

  const { heading, text, actions } = data
  console.log("🚀 ~ PostSectionHeader ~ text:", text)

  return (
    <PostSectionBase
      data={data}
      className={clsx(
        `[--default-background-color:white] [--default-text-align:center]`,
        `border-b-gray-200 first:border-b group-first:border-b`,
      )}
    >
      <Container className="!max-w-6xl bg-accent-50">
        <div className="inline-grid max-w-prose gap-6">
          {heading && <PageHeading>{heading.value}</PageHeading>}
          <SectionText content={text?.value} />
        </div>

        {actions && actions.length > 0 && (
          <div className="mt-8">
            <ActionList actions={actions} className="inline-flex" />
          </div>
        )}
      </Container>
    </PostSectionBase>
  )
}

export default PostSectionHeader

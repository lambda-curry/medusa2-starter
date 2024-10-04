import clsx from "clsx"
import { type CTAPageSection } from "@libs/util/medusa/types"
import { PostSectionBase, SectionBaseProps } from "./shared/PostSectionBase"
import { type SectionComponent } from "./types"
import { ActionList } from "../ActionList"
import { SectionHeading } from "../SectionHeading"
import { SectionText } from "../SectionText"
import { Container } from "@ui-components/common/container/Container"
import { Grid } from "@ui-components/common/grid/Grid"
import { GridColumn } from "@ui-components/common/grid/GridColumn"
import { FC } from "react"

export const PostSectionCTA: FC<SectionBaseProps> = ({ data }) => {
  if (!data) return null

  const { heading, text, actions } = data

  return (
    <PostSectionBase
      data={data}
      className={clsx(
        `[--default-background-color:var(--color-primary-900)] [--default-color:var(--color-primary-100)]`,
        `[--default-text-align:left] [--mobile-text-align:center]`,
      )}
    >
      <Container className="!max-w-6xl">
        <Grid className="items-center">
          <GridColumn className="md:col-span-7">
            {heading && <SectionHeading>{heading.value}</SectionHeading>}
            {text && <SectionText content={text.value} />}
          </GridColumn>
          <GridColumn className="md:col-span-5">
            {!!actions?.length && (
              <ActionList
                actions={actions}
                className="mt-4 justify-center md:col-span-4 md:mt-0 md:justify-end"
              />
            )}
          </GridColumn>
        </Grid>
      </Container>
    </PostSectionBase>
  )
}

export default PostSectionCTA

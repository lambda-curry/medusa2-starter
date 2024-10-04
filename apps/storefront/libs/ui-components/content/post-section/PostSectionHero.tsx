import clsx from "clsx"
import { BackgroundType, HeroContent } from "@libs/util/medusa/types"
import { PostSectionBase, SectionBaseProps } from "./shared/PostSectionBase"
import { type SectionComponent } from "./types"
import { ActionList } from "../ActionList"
import { PageHeading } from "../PageHeading"
import { SectionText } from "../SectionText"
import { Container } from "@ui-components/common/container/Container"
import { PostSectionImage } from "./shared/PostSectionImage"
import { SectionHero as BasePostSectionHero } from "./shared/PostSectionHero"
import { FC } from "react"

export const PostSectionHero: FC<SectionBaseProps<HeroContent>> = ({
  data,
}) => {
  const { heading, text, actions, image } = data || {}

  return (
    <BasePostSectionHero data={data}>
      <Container>
        <div className="flex flex-col-reverse lg:flex-row">
          <div className="h-auto flex-1 overflow-hidden py-4 lg:max-w-[50%] lg:py-24 lg:pr-8">
            <div className="mr-8 inline-grid max-w-prose gap-6">
              {heading && (
                <PageHeading
                  className="break-words"
                  style={{
                    wordBreak: "break-word",
                  }}
                >
                  {heading.value}
                </PageHeading>
              )}
              <SectionText className="break-words" content={text?.value} />
            </div>

            {!!actions?.length && (
              <ActionList actions={actions} className="mt-8 lg:mt-10" />
            )}
          </div>

          <div className="-mx-4 w-screen flex-1 sm:-mx-6 md:-mx-8 lg:mx-0">
            {image && (
              <PostSectionImage
                image={image}
                className="object-cover lg:absolute lg:w-1/2 aspect-[3/2] w-full bg-gray-50 lg:aspect-auto lg:h-full right-0"
              />
            )}
          </div>
        </div>
      </Container>
    </BasePostSectionHero>
  )
}

export default PostSectionHero

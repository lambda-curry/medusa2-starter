import clsx from "clsx"
import { CustomAction, ImageField } from "@libs/util/medusa/types"
import { ActionList } from "../ActionList"
import { Container } from "@ui-components/common/container/Container"
import { FC, ReactNode } from "react"
import { Image } from "@ui-components/common/images/Image"

export const HeroSection: FC<{
  title?: string
  content?: ReactNode
  actions?: CustomAction[]
  image?: ImageField
  className?: string
  backgroundClassName?: string
}> = ({ title, content, actions, image, className, backgroundClassName }) => {
  return (
    <Container
      className={clsx(
        "flex flex-col justify-center items-center relative w-full",
        className,
      )}
    >
      {/* <div className="flex flex-col relative h-full"> */}
      <div
        className={clsx(
          "mkt-section__background-overlay flex-1 z-0 bg-cover bg-no-repeat bg-center",
          backgroundClassName,
        )}
        style={{
          backgroundImage: `url(${image?.url})`,
        }}
      />
      <div className="overflow-hidden z-10 w-full text-white">
        <div className="inline-grid gap-6 w-full">
          {title && <div className="break-words">{title}</div>}
          {typeof content === "string" ? (
            <div className="text-lg w-full">{content}</div>
          ) : (
            content
          )}
        </div>

        {!!actions?.length && (
          <ActionList actions={actions} className="mt-8 lg:mt-10 flex-col" />
        )}
      </div>
      {/* </div> */}
    </Container>
  )
}

export default HeroSection

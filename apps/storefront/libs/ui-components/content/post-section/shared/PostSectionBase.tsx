import { FC, HTMLAttributes } from "react"
import clsx from "clsx"
import { BasePageSectionContent } from "@libs/util/medusa/types"

export interface SectionBaseProps<
  TData extends BasePageSectionContent = BasePageSectionContent,
  TElement extends HTMLElement = HTMLDivElement,
> extends HTMLAttributes<TElement> {
  data: TData | undefined
}

export const PostSectionBase: FC<SectionBaseProps> = ({
  data,
  className,
  children,
  ...props
}) => {
  return (
    <>
      <section className={clsx(`mkt-section relative`, className)} {...props}>
        <div className="mkt-section__inner relative z-[2]">{children}</div>
      </section>
    </>
  )
}

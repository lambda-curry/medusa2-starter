import { FC, HTMLAttributes } from "react"
import clsx from "clsx"
import { URLAwareNavLink } from "@ui-components/common/link/URLAwareNavLink"
import { Button } from "@ui-components/common/buttons"
import { type CustomAction } from "@libs/util/medusa/types"

export interface ActionListProps extends HTMLAttributes<HTMLDivElement> {
  actions: CustomAction[]
}

export const ActionList: FC<ActionListProps> = ({
  actions,
  className,
  ...props
}) => (
  <div
    className={clsx("flex flex-wrap items-center gap-4 lg:gap-6", className)}
  >
    {actions.map(({ url, label, new_tab, style_variant }, index) => {
      const {
        labelValue,
        urlValue,
      } = // TODO: REMOVE THIS
        typeof label === "string"
          ? { labelValue: label, urlValue: url }
          : {
              labelValue: (label as any).value as string,
              urlValue: (url as any).value as string,
            }

      if (!urlValue) return null

      return (
        <Button
          variant={style_variant}
          key={index}
          as={(buttonProps) => (
            <URLAwareNavLink url={urlValue} newTab={new_tab} {...buttonProps}>
              {labelValue}
            </URLAwareNavLink>
          )}
        />
      )
    })}
  </div>
)

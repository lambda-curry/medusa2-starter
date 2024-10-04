import type { FC, PropsWithChildren } from "react"
import { Link } from "@remix-run/react"
import clsx from "clsx"
import { useSiteDetails } from "@ui-components/hooks/useSiteDetails"
import { Image } from "@ui-components/common/images/Image"

const LogoHeader: FC<
  PropsWithChildren & { primary: boolean | undefined; className: string }
> = ({ primary, className, ...rest }) =>
  primary ? (
    <h1 className={clsx("logo-header", className)} {...rest} />
  ) : (
    <h2 className={className} {...rest} />
  )

export const LogoStoreName: FC<{ primary?: boolean; className?: string }> = ({
  primary,
  className,
}) => {
  const { store, settings } = useSiteDetails()

  if (!store || !settings) return null

  return (
    <Link
      unstable_viewTransition
      to="/"
      prefetch="intent"
      className={clsx(
        "logo-header flex flex-nowrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-4",
        className,
      )}
    >
      {/* {store?.logo?.url && (
        <Image
          className={clsx('xs:max-h-14 max-h-9')}
          width="auto"
          src={store.logo.url}
          alt={`${store.name} logo`}
        />
      )} */}
      <LogoHeader
        primary={primary}
        className={clsx(
          "xs:text-2xl whitespace-nowrap text-lg font-bold font-italiana",
          {
            "sr-only": false,
          },
        )}
      >
        {store?.name}
      </LogoHeader>
    </Link>
  )
}

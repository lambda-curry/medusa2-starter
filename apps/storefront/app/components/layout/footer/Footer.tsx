import { useSiteDetails } from "@ui-components/hooks/useSiteDetails"
import { Container } from "@components/container/Container"
import { URLAwareNavLink } from "@components/link/URLAwareNavLink"
import type { NavigationItem } from "@libs/util/medusa/types"
import clsx from "clsx"
import { SocialIcons } from "./SocialIcons"
import { MarketHausLogoMonotone } from "@components/assets/markethaus/logos/MarketHausLogoMonotone"
import { useRootLoaderData } from "@ui-components/hooks/useRootLoaderData"
import { LogoStoreName } from "~/components/LogoStoreName/LogoStoreName"
import { StripeSecurityImage } from "../../images/StripeSecurityImage"

export const Footer = () => {
  const { store, footer_navigation_items, site_settings } = useSiteDetails()
  const rootData = useRootLoaderData()
  const hasProducts = rootData?.hasPublishedProducts

  return (
    <footer id="mkt-footer" className="bg-primary-100 min-h-[140px] py-8">
      <Container>
        <div className="flex w-full flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-16">
          <div className="flex w-full flex-col items-center gap-8 sm:w-auto sm:items-start sm:gap-4">
            <LogoStoreName />
            <SocialIcons siteSettings={site_settings} />

            <nav
              className={clsx("pt-2", {
                "columns-2 gap-16":
                  footer_navigation_items &&
                  footer_navigation_items?.length > 5,
              })}
            >
              {(footer_navigation_items as NavigationItem[]).map(
                ({ id, new_tab, ...navItemProps }) => (
                  <URLAwareNavLink
                    key={id}
                    {...navItemProps}
                    newTab={new_tab}
                    className="text-primary-800 hover:text-primary-900 block pb-6 text-sm font-bold"
                    prefetch="intent"
                  >
                    {navItemProps.label}
                  </URLAwareNavLink>
                ),
              )}
            </nav>
          </div>
        </div>
        <div className="text-primary-900 mx-auto mt-10 flex w-[320px] max-w-full flex-wrap items-end justify-between gap-4 sm:w-full">
          {store?.type === "markethaus" && (
            <a
              href="https://www.market.haus/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start gap-1 text-xs"
            >
              <span>Powered by</span>
              <MarketHausLogoMonotone className="!h-4 !text-inherit" />
            </a>
          )}
          <div className="-mt-8 flex flex-col items-end justify-end text-xs sm:mt-0">
            <span>
              {store?.name} &copy; {new Date().getFullYear()}{" "}
            </span>
            {hasProducts && <StripeSecurityImage className="mt-2" />}
          </div>
        </div>
      </Container>
    </footer>
  )
}

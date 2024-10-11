import { useSiteDetails } from "@ui-components/hooks/useSiteDetails"
import { Container } from "@ui-components/common/container/Container"
import { URLAwareNavLink } from "@ui-components/common/link/URLAwareNavLink"
import type { NavigationItem } from "@libs/util/medusa/types"
import clsx from "clsx"
import { SocialIcons } from "./SocialIcons"
import { MarketHausLogoMonotone } from "@ui-components/common/assets/markethaus/logos/MarketHausLogoMonotone"
import { useRootLoaderData } from "@ui-components/hooks/useRootLoaderData"
import { LogoStoreName } from "~/components/LogoStoreName/LogoStoreName"
import { StripeSecurityImage } from "../../images/StripeSecurityImage"
import { NewsletterSubscription } from "~/components/newsletter/Newsletter"
import { Select } from "@ui-components/common/forms/inputs/Select"

export const Footer = () => {
  const { footerNavigationItems, settings } = useSiteDetails()
  const rootData = useRootLoaderData()
  const hasProducts = rootData?.hasPublishedProducts

  return (
    <footer className="bg-accent-50 min-h-[140px] py-8 text-white">
      <Container>
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 w-full flex-col items-center gap-8 sm:flex-row sm:items-start sm:gap-16">
          <div className="flex w-full flex-col items-center gap-8 sm:w-auto sm:items-start sm:gap-9 sm:col-span-2 lg:col-span-3">
            <div className="flex flex-col gap-5">
              <h4 className="font-bold">Coffee & Community</h4>
              <p className="text-sm">
                Barrio Coffee is a specialty coffee roaster and cafe located in
                East Austin. We offer freshly roasted beans with an experienced
                balance of quality flavors. Come enjoy our custom house-blends
                and our assortment of single origin coffees.
              </p>
            </div>
            <LogoStoreName />
          </div>

          <nav
            className={clsx("pt-2", {
              "columns-2 gap-16":
                footerNavigationItems && footerNavigationItems?.length > 5,
            })}
          >
            <h5 className="font-bold mb-4">Shop</h5>
            {footerNavigationItems?.map(({ id, new_tab, ...navItemProps }) => (
              <URLAwareNavLink
                key={id}
                {...navItemProps}
                newTab={new_tab}
                className="hover:text-slate-200 block pb-2 text-sm"
                prefetch="intent"
              >
                {navItemProps.label}
              </URLAwareNavLink>
            ))}
          </nav>
          <div className="flex flex-col gap-5 lg:col-span-2">
            <NewsletterSubscription className="mb-4" />

            <SocialIcons siteSettings={settings} />

            <div className="flex flex-col gap-4 mt-4">
              <h5>Location</h5>
              <p className="text-sm">
                1619 E Cesar Chavez St, Austin, TX 78702
                <br />
                Open 7AM - 4PM Daily
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col max-md:items-center gap-8 mt-8 md:flex-row md:justify-between">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-2 ">
              <Select
                className="!text-base border-1 border-white text-white bg-transparent !shadow-none"
                options={[
                  {
                    label: "United States (USD $)",
                    value: "USD",
                  },
                  {
                    label: "Canada (CAD $)",
                    value: "CAD",
                  },
                ]}
                onChange={() => { }}
              />
            </div>

            <a
              href="https://www.market.haus/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-start gap-1 text-sm"
            >
              © {new Date().getFullYear()} Powered by MarketHaus
            </a>
          </div>
          <div className="mt-1 flex flex-col justify-end text-xs sm:mt-0">
            {hasProducts && <StripeSecurityImage className="mt-2" />}
          </div>
        </div>
      </Container>
    </footer>
  )
}

import Bars3Icon from "@heroicons/react/24/outline/Bars3Icon"
import MagnifyingGlassIcon from "@heroicons/react/24/outline/MagnifyingGlassIcon"
import ShoppingCartIcon from "@heroicons/react/24/outline/ShoppingCartIcon"
import UserCircleIcon from "@heroicons/react/24/solid/UserCircleIcon"
import { useCart } from "@ui-components/hooks/useCart"
import { useCustomer } from "@ui-components/hooks/useCustomer"
import { useLogin } from "@ui-components/hooks/useLogin"
import { useRootLoaderData } from "@ui-components/hooks/useRootLoaderData"
import { useSearch } from "@ui-components/hooks/useSearch"
import { useSiteDetails } from "@ui-components/hooks/useSiteDetails"
import { ButtonBase, IconButton } from "@ui-components/common/buttons"
import { Container } from "@ui-components/common/container/Container"
import { URLAwareNavLink } from "@ui-components/common/link"
import { NavigationItem } from "@libs/util/medusa/types"
import clsx from "clsx"
import { FC, useState } from "react"
import { HeaderSideNav } from "./HeaderSideNav"
import { HeaderUserMenu } from "./HeaderUserMenu"
import { useActiveSection } from "./useActiveSection"
import { LogoStoreName } from "~/components/LogoStoreName/LogoStoreName"

export interface HeaderProps {}

export const Header: FC<HeaderProps> = () => {
  const [sideNavOpen, setSideNavOpen] = useState<boolean>(false)
  const { headerNavigationItems } = useSiteDetails()
  const { customer } = useCustomer()
  const { cart, toggleCartDrawer } = useCart()
  const { toggleSearchDrawer } = useSearch()
  const { toggleLoginModal } = useLogin()
  const { activeSection } = useActiveSection(headerNavigationItems)
  const rootLoader = useRootLoaderData()
  const hasProducts = rootLoader?.hasPublishedProducts

  const isLoggedIn = customer?.id

  if (!headerNavigationItems) return <>Loading...</>

  return (
    <header className="sticky top-0 z-40 mkt-header text-white">
      <nav aria-label="Top">
        <div className="bg-transparent">
          <div className="">
            <Container>
              {hasProducts && (
                <div className="-mb-2 flex w-full items-center justify-end gap-4 pt-2 sm:hidden">
                  {/* {!isLoggedIn && (
                    <IconButton
                      aria-label="open login modal"
                      onClick={() => toggleLoginModal(true)}
                      icon={UserCircleIcon}
                      iconProps={{ className: "!w-[28px] !h-[28px]" }}
                      className="mkt-header-login-button hover:!bg-primary-50 focus:!bg-primary-50"
                    />
                  )} */}

                  {/* {isLoggedIn && <HeaderUserMenu />} */}

                  {!!cart && (
                    <IconButton
                      aria-label="open shopping cart"
                      className="text-white sm:mr-0.5"
                      icon={(iconProps) => (
                        <div className="relative">
                          <ShoppingCartIcon
                            {...iconProps}
                            className={clsx(
                              iconProps.className,
                              "hover:!bg-primary-50 focus:!bg-primary-50",
                            )}
                          />
                          {cart.items && cart.items.length > 0 && (
                            <span className="bg-primary-500 absolute -top-1 left-full -ml-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-xs font-bold text-white">
                              <span>
                                {cart.items.reduce(
                                  (acc, item) => acc + item.quantity,
                                  0,
                                )}{" "}
                                <span className="sr-only">
                                  items in cart, view bag
                                </span>
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                      onClick={() => toggleCartDrawer(true)}
                    />
                  )}

                  <div className="flex-auto" />

                  <ButtonBase
                    className="mkt-header-search-button flex items-center gap-2 rounded-full px-2 py-2 pl-3 hover:bg-gray-100 hover:text-gray-700 focus:text-gray-700 sm:hidden"
                    onClick={() => toggleSearchDrawer(true)}
                  >
                    <span className="text-sm font-bold">Search</span>
                    <MagnifyingGlassIcon
                      className={clsx("-mr-0.5 h-6 w-6 text-current")}
                    />
                  </ButtonBase>
                </div>
              )}

              <div
                className={clsx(
                  "h-[var(--mkt-header-height)] flex sm:h-[var(--mkt-header-height-desktop)] flex-nowrap items-center justify-between gap-2 py-2",
                )}
              >
                <LogoStoreName className="xs:h-14 h-8" primary />
                <div className="flex flex-wrap-reverse items-center gap-x-6 sm:justify-end">
                  {headerNavigationItems && (
                    <div className="hidden h-full gap-6 md:flex">
                      {headerNavigationItems
                        .slice(0, 6)
                        .map(({ id, new_tab, ...navItemProps }, index) => (
                          <URLAwareNavLink
                            key={id}
                            {...navItemProps}
                            newTab={new_tab}
                            className={({ isActive }) =>
                              clsx(
                                "my-4 flex items-center whitespace-nowrap text-sm font-normal hover:text-gray-500",
                                {
                                  "border-b-primary-200 border-b-2":
                                    isActive &&
                                    (!navItemProps.url.includes("#") ||
                                      activeSection ===
                                        navItemProps.url
                                          .split("#")[1]
                                          .split("?")[0]),
                                  "hidden 2xl:inline-block": index === 5,
                                  "hidden xl:inline-block":
                                    index === 3 || index === 4,
                                  "hidden lg:inline-block": index === 2,
                                  "hidden md:inline-block": index === 1,
                                },
                              )
                            }
                            prefetch="intent"
                          >
                            {navItemProps.label}
                          </URLAwareNavLink>
                        ))}
                    </div>
                  )}

                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-x-3 text-sm">
                      {hasProducts && (
                        <ButtonBase
                          className="mkt-header-search-button hidden items-center gap-2 rounded-full px-3 py-2 hover:bg-gray-100 hover:text-gray-700 focus:text-gray-700 sm:flex"
                          onClick={() => toggleSearchDrawer(true)}
                        >
                          <span className="text-sm font-bold">Search</span>
                          <MagnifyingGlassIcon
                            className={clsx("-mr-0.5 h-6 w-6 text-current")}
                          />
                        </ButtonBase>
                      )}

                      {!!cart && hasProducts && (
                        <IconButton
                          aria-label="open shopping cart"
                          className="text-white hidden sm:mr-0.5 sm:inline-flex"
                          icon={(iconProps) => (
                            <div className="relative">
                              <ShoppingCartIcon
                                {...iconProps}
                                className={clsx(
                                  iconProps.className,
                                  "hover:!bg-primary-50 focus:!bg-primary-50",
                                )}
                              />
                              {cart.items && cart.items.length > 0 && (
                                <span className="bg-primary-500 absolute -top-1 left-full -ml-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full px-1 text-xs font-bold text-white">
                                  <span>
                                    {cart.items.reduce(
                                      (acc, item) => acc + item.quantity,
                                      0,
                                    )}{" "}
                                    <span className="sr-only">
                                      items in cart, view bag
                                    </span>
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                          onClick={() => toggleCartDrawer(true)}
                        />
                      )}

                      {/* {!isLoggedIn && hasProducts && (
                        <IconButton
                          aria-label="open login modal"
                          onClick={() => toggleLoginModal(true)}
                          icon={UserCircleIcon}
                          iconProps={{ className: "!w-[28px] !h-[28px]" }}
                          className="mkt-header-login-button hover:!bg-primary-50 focus:!bg-primary-50 hidden sm:inline-flex"
                        />
                      )}

                      {isLoggedIn && hasProducts && (
                        <HeaderUserMenu className="hidden sm:block" />
                      )} */}

                      {!!headerNavigationItems?.length && (
                        <IconButton
                          aria-label="open navigation menu"
                          onClick={() => setSideNavOpen(true)}
                          className={clsx(
                            "text-white hover:!bg-primary-50 focus:!bg-primary-50 sm:inline-flex",
                            {
                              "2xl:hidden": headerNavigationItems.length <= 5,
                              "xl:hidden": headerNavigationItems.length <= 4,
                              "lg:hidden": headerNavigationItems.length <= 3,
                            },
                          )}
                          icon={Bars3Icon}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </nav>
      <HeaderSideNav
        activeSection={activeSection}
        open={sideNavOpen}
        setOpen={setSideNavOpen}
      />
    </header>
  )
}

import { FC } from "react"
import { NavLink, useFetcher } from "@remix-run/react"
import clsx from "clsx"
import ListBulletIcon from "@heroicons/react/24/outline/ListBulletIcon"
import ArrowRightOnRectangleIcon from "@heroicons/react/24/outline/ArrowRightOnRectangleIcon"
import { Avatar } from "@ui-components/common/avatar"
import { Menu, MenuProps } from "@ui-components/common/menu/Menu"
import { MenuButton } from "@ui-components/common/menu/MenuButton"
import { MenuItems } from "@ui-components/common/menu/MenuItems"
import {
  MenuItem,
  MenuItemRenderProps,
} from "@ui-components/common/menu/MenuItem"
import { IconButton } from "@ui-components/common/buttons/IconButton"
import { MenuItemIcon } from "@ui-components/common/menu/MenuItemIcon"
import { ButtonBase } from "@ui-components/common/buttons/ButtonBase"
import { useCustomer } from "../../../../libs/ui-components/hooks/useCustomer"

export const HeaderUserMenu: FC<MenuProps> = (props) => {
  const logoutFetcher = useFetcher<{}>()
  const { customer } = useCustomer()

  const handleLogout = () => {
    logoutFetcher.submit(
      { subaction: "logout", redirect: "/" },
      {
        action: "/api/auth",
        method: "post",
      },
    )
  }

  return (
    <Menu {...props}>
      <MenuButton>
        <IconButton
          aria-label="open menu to view orders or log out"
          className="!text-primary-700 hover:!bg-primary-50 focus:!bg-primary-50"
          icon={(iconProps) => (
            <Avatar {...iconProps} firstName={customer?.email} />
          )}
        />
      </MenuButton>
      <MenuItems className="sm:position-bottom-right">
        <MenuItem
          item={(itemProps) => (
            <NavLink
              {...itemProps}
              to="/orders"
              className={({ isActive }) =>
                clsx(
                  { "text-primary-700 font-bold": isActive },
                  itemProps.className,
                )
              }
            >
              <MenuItemIcon icon={ListBulletIcon} />
              My Orders
            </NavLink>
          )}
        />
        <MenuItem
          item={(itemProps: MenuItemRenderProps) => (
            <ButtonBase
              {...itemProps}
              className={clsx("!justify-start", itemProps.className)}
              onClick={handleLogout}
            >
              <MenuItemIcon icon={ArrowRightOnRectangleIcon} />
              Log out
            </ButtonBase>
          )}
        />
      </MenuItems>
    </Menu>
  )
}

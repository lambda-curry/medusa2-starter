import { Text } from '@medusajs/ui'
import { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

export type INavItem = {
  icon?: ReactNode
  label: string
  to: string
  from?: string
}

const BASE_NAV_LINK_CLASSES =
  'text-ui-fg-subtle transition-fg hover:bg-ui-bg-subtle-hover flex items-center gap-x-2 rounded-md py-0.5 pl-0.5 pr-2 outline-none [&>svg]:text-ui-fg-subtle focus-visible:shadow-borders-focus'

export const NavItem = ({ icon, label, to, from }: INavItem) => {
  return (
    <div className="px-3">
      <NavLink
        to={to}
        end
        state={
          from
            ? {
                from,
              }
            : undefined
        }
        className={BASE_NAV_LINK_CLASSES}
      >
        <div className="flex size-6 items-center justify-center">{icon}</div>
        <Text size="small" weight="plus" leading="compact">
          {label}
        </Text>
      </NavLink>
    </div>
  )
}

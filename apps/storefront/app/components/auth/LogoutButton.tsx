import { FC } from "react"
import { useFetcher } from "@remix-run/react"
import ArrowLeftOnRectangleIcon from "@heroicons/react/24/outline/ArrowLeftOnRectangleIcon"
import { IconButton } from "@ui-components/common/buttons"

export interface LogoutButtonProps {
  redirect?: string
}

export const LogoutButton: FC<LogoutButtonProps> = ({ redirect = "/" }) => {
  const fetcher = useFetcher<{}>()

  return (
    <fetcher.Form method="post" action="/api/auth">
      <input type="hidden" name="subaction" value="logout" />
      <input type="hidden" name="redirect" value={redirect} />
      <IconButton
        type="submit"
        icon={ArrowLeftOnRectangleIcon}
        aria-label="log out"
        className="rotate-180"
      />
    </fetcher.Form>
  )
}

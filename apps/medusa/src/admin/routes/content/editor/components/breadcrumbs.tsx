import { clx } from "@medusajs/ui"
import { TriangleRightMini } from "@medusajs/icons"
import { Link, useLoaderData } from "react-router-dom"

type Crumb = {
  label: string
  path?: string
}

export const Breadcrumbs = () => {
  const data = useLoaderData() as any

  const crumbs: Crumb[] = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Content",
      path: "/content",
    },
  ]

  if (data?.post) {
    const post = data.post
    const type = post.type?.charAt(0).toUpperCase() + post.type?.slice(1) as string

    crumbs.push(...[
      {
        label: type,
      },
      {
        label: post.title as string,
        path: post.id as string,
      },
    ])
  }
  
  return (
    <ol
      className={clx(
        "text-ui-fg-muted txt-compact-small-plus flex select-none items-center"
      )}
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        const isSingle = crumbs.length === 1

        return (
          <li key={index} className={clx("flex items-center")}>
            {!isLast && crumb.path ? (
              <Link
                className="transition-fg hover:text-ui-fg-subtle"
                to={crumb.path}
              >
                {crumb.label}
              </Link>
            ) : (
              <div>
                {!isSingle && isLast && <span className="block lg:hidden">...</span>}
                <span
                  key={index}
                  className={clx({
                    "hidden lg:block": !isSingle && isLast,
                  })}
                >
                  {crumb.label}
                </span>
              </div>
            )}
            {!isLast && (
              <span className="mx-2">
                <TriangleRightMini />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
} 
import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node"

import * as pagesMap from "@libs/config/pages"
import { getMergedPostMeta } from "@libs/util/posts"
import { useLoaderData } from "@remix-run/react"
import { Container } from "@ui-components/common/container"
import { PageTemplate } from "~/templates/PageTemplate"
import { Page } from "@libs/util/medusa/types"

const trimHandle = (handle: string) => handle.replace(/\/$/, "")

const pagesByHandle = Object.values(pagesMap as Record<string, Page>).reduce(
  (acc, page) => {
    const trimmedHandle = trimHandle(page.handle)
    acc[trimmedHandle] = { ...page, handle: trimmedHandle }
    return acc
  },
  {} as Record<string, typeof pagesMap[keyof typeof pagesMap]>,
)

export const loader = async (args: LoaderFunctionArgs) => {
  console.log("🚀 ~ $t.tsx ~ loader ~ args:", args)
  const handle = args.params["*"] as string

  const trimmedHandle = trimHandle(handle)

  const page = pagesByHandle[trimmedHandle]

  if (!page) return redirect("/")

  return { page }
}

export const meta: MetaFunction<typeof loader> = getMergedPostMeta

export default function DynamicPage() {
  const { page, ...data } = useLoaderData<{ page: Page }>()

  if (!page)
    return (
      <Container className="my-8">
        <h2>This page doesn't exist.</h2>
      </Container>
    )

  return <PageTemplate page={page} />
}

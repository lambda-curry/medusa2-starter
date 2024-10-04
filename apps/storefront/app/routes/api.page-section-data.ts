import { buildObjectFromSearchParams } from "@libs/util/buildObjectFromSearchParams"
import {
  // BlogListPostSection,
  BasePageSection,
} from "@libs/util/medusa/types"
import {
  MappedDataSections,
  // getBlogPostListData,
  getProductListData,
} from "@libs/util/server/page.server"
import { LoaderFunctionArgs, unstable_data as data } from "@remix-run/node"

export enum SectionDataAction {
  productList = "productList",
  blogPostList = "blogPostList",
}

export type PostData = Record<BasePageSection["id"], any>

const productList = async (
  section: MappedDataSections,
  { request }: Pick<LoaderFunctionArgs, "request">,
) => {
  const result = await getProductListData(request, section)
  return data(result, {
    headers: { "Cache-Control": "max-age=60, stale-while-revalidate=300" },
  })
}

// const blogPostList = async (
//   section: BlogListPostSection,
//   { request }: Pick<LoaderFunctionArgs, "request">,
// ) => {
//   const result = await getBlogPostListData(section, request)
//   return data(result, {
//     headers: { "Cache-Control": "max-age=60, stale-while-revalidate=300" },
//   })
// }

const loaders = {
  productList,
  // blogPostList,
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)

  const { subloader, data } = buildObjectFromSearchParams<{
    subloader: keyof typeof loaders
    data: string
  }>(url.searchParams)

  const _loader = loaders[subloader]

  if (!_loader)
    throw new Error(`Action handler not found for "${subloader}" loader.`)

  const parsedData = JSON.parse(data)

  return await _loader(parsedData, { request })
}

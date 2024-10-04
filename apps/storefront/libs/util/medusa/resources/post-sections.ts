import {
  BaseHttpRequest,
  CancelablePromise,
} from "@markethaus/storefront-client"
import {
  PageSectionStatus,
  PageSectionType,
  PageSectionsListRes,
} from "../types"

export interface PostSectionsListQueryOptions {
  limit?: number
  offset?: number
  fields?: string
  id?: string | string[]
  name?: string
  status?: PageSectionStatus
  type?: PageSectionType
}

export class PostSectionsResource {
  constructor(public readonly request: BaseHttpRequest) {}
  list(
    options: PostSectionsListQueryOptions = {},
    customHeaders: Record<string, any> = {},
  ): CancelablePromise<PageSectionsListRes> {
    const query = new URLSearchParams([...Object.entries(options)]).toString()
    const path = `/store/post-sections${query.length > 0 ? `?${query}` : ""}`

    return this.request.request({
      method: "GET",
      url: path,
      headers: customHeaders,
    })
  }

  retrieve(
    id: string,
    customHeaders: Record<string, any> = {},
  ): CancelablePromise<{ post_section: PageSectionType }> {
    return this.request.request({
      method: "GET",
      url: `/store/post-sections/${id}`,
      headers: customHeaders,
    })
  }
}

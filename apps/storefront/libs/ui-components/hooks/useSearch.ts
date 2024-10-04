//@ts-ignore issue with use debounce types hoisted globally
import { useDebouncedCallback } from "use-debounce"
import { useFetcher } from "@remix-run/react"
import { useStorefront } from "./useStorefront"
import { PricedProduct } from "@markethaus/storefront-client"
import { loader as searchLoader } from "../../../app/routes/_todo/search"
import { PaginationConfig } from "@ui-components/common/Pagination"
import {
  ProductCategory,
  ProductCollection,
  ProductTag,
} from "@libs/util/medusa"

export interface SearchPageData {
  products: PricedProduct[]
  collections: ProductCollection[]
  categories: ProductCategory[]
  tags: ProductTag[]
  searchTerm: string
  paginationConfig?: PaginationConfig
}

export const useSearch = () => {
  const { state, actions } = useStorefront()

  const searchFetcher = useFetcher<typeof searchLoader>()

  const fetchSearch = () =>
    searchFetcher.load(
      `/search?index${window.location.search.replace("?", "&")}`,
    )

  const handleSearchChange = useDebouncedCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (typeof window !== undefined) {
        const url = new URL(window.location.href)
        url.searchParams.delete("page")
        if (!event.target.value) url.searchParams.delete("term")
        else url.searchParams.set("term", event.target.value)
        window.history.replaceState({}, "", url.href)
      }
      fetchSearch()
    },
    200,
    { leading: true },
  )

  const clearSearch = () => {
    if (typeof window !== undefined) {
      const url = new URL(window.location.href)
      url.searchParams.delete("term")
      window.history.replaceState({}, "", url.href)
      fetchSearch()
    }
  }

  if (!state.search)
    throw new Error(
      "useSearch must be used within the StorefrontContext.Provider",
    )

  return {
    search: state.search,
    clearSearch,
    fetchSearch,
    searchTerm: searchFetcher.data?.searchTerm,
    searchFetcher,
    handleSearchChange,
    toggleSearchDrawer: actions.toggleSearchDrawer,
  }
}

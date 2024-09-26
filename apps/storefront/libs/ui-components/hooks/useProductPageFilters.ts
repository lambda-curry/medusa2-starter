import { useRouteLoaderData, useSearchParams } from "@remix-run/react"
import cloneDeep from "lodash/cloneDeep"
import qs from "qs"
import { useMemo } from "react"
import { ProductsIndexRouteLoader } from "../../../app/routes/_todo/products._index"
import { FilterOptions, nestCategories } from "@libs/util/product-filters"

export const parseProductPageFilterSearchParams = (
  filterSearchParams: string,
) =>
  qs.parse(decodeURIComponent(filterSearchParams), {
    parseArrays: true,
    comma: true,
  }) as unknown as Record<string, string[] | string>

type FilterKeys = keyof FilterOptions

export interface FilterState {
  selected: string[]
  setSelected: (values: string | string[]) => void
  clearSelected: () => void
}

interface OrderState {
  selected: string
  setSelected: (value: string) => void
}

export interface ProductPageFiltersHook {
  filters: FilterOptions
  allFilters: FilterOptions
  filterQuery: Record<string, string[] | string>
  collectionFilterState: FilterState
  categoryFilterState: FilterState
  tagFilterState: FilterState
  orderState: OrderState
}

export const useProductPageFilters: ({
  filterOptions,
  allFilterOptions,
}: {
  filterOptions: FilterOptions
  allFilterOptions: FilterOptions
}) => ProductPageFiltersHook = ({
  filterOptions = {},
  allFilterOptions = {},
}) => {
  const productRouteData = useRouteLoaderData<ProductsIndexRouteLoader>(
    "routes/products._index",
  )
  const [searchParams, setSearchParams] = useSearchParams()

  const filterSearchParams = searchParams.get("filters")

  const formattedFilters: FilterOptions = useMemo(() => {
    if (!filterOptions) return {}
    const clonedFilters = cloneDeep(filterOptions)
    if (clonedFilters.categories)
      clonedFilters.categories = nestCategories(clonedFilters.categories)
    return clonedFilters
  }, [filterOptions])

  const formattedAllFilters: FilterOptions = useMemo(() => {
    if (!allFilterOptions) return {}
    const clonedAllFilters = cloneDeep(allFilterOptions)
    if (clonedAllFilters.categories)
      clonedAllFilters.categories = nestCategories(clonedAllFilters.categories)
    return clonedAllFilters
  }, [filterOptions, allFilterOptions])

  const filterQuery = useMemo(() => {
    if (!filterSearchParams) return {}
    return parseProductPageFilterSearchParams(filterSearchParams)
  }, [filterSearchParams])

  const updateFilterQuery = (key: string, value: string | string[]) => {
    const query = filterQuery
    query[key] = value
    const newQuery = qs.stringify(query, { arrayFormat: "comma" })
    return newQuery
  }

  const selectedCollections =
    typeof filterQuery?.collections === "string"
      ? [filterQuery.collections]
      : filterQuery.collections || []
  const setSelectedCollections = (collections: string[]) => {
    const newQuery = updateFilterQuery("collections", collections)
    setSearchParams({ filters: newQuery })
  }
  const clearSelectedCollections = () =>
    setSearchParams({ filters: updateFilterQuery("collections", []) })

  const selectedCategories =
    typeof filterQuery?.categories === "string"
      ? [filterQuery.categories]
      : filterQuery.categories || []
  const setSelectedCategories = (categories: string[]) => {
    const newQuery = updateFilterQuery("categories", categories)
    setSearchParams({ filters: newQuery })
  }
  const clearSelectedCategories = () =>
    setSearchParams({ filters: updateFilterQuery("categories", []) })

  const selectedTags =
    typeof filterQuery.tags === "string"
      ? [filterQuery.tags]
      : filterQuery.tags || []
  const setSelectedTags = (tags: string[]) => {
    const newQuery = updateFilterQuery("tags", tags)
    setSearchParams({ filters: newQuery })
  }
  const clearSelectedTags = () =>
    setSearchParams({ filters: updateFilterQuery("tags", []) })

  const selectedOrder =
    typeof filterQuery?.order === "string" ? filterQuery.order : "popularity"
  const setSelectedOrder = (order: string) => {
    const newQuery = updateFilterQuery("order", order)
    setSearchParams({ filters: newQuery })
  }

  return {
    filters: formattedFilters,
    allFilters: formattedAllFilters,
    filterQuery,
    collectionFilterState: {
      selected: selectedCollections,
      setSelected: setSelectedCollections,
      clearSelected: clearSelectedCollections,
    } as FilterState,
    categoryFilterState: {
      selected: selectedCategories,
      setSelected: setSelectedCategories,
      clearSelected: clearSelectedCategories,
    } as FilterState,
    tagFilterState: {
      selected: selectedTags,
      setSelected: setSelectedTags,
      clearSelected: clearSelectedTags,
    } as FilterState,
    orderState: {
      selected: selectedOrder,
      setSelected: setSelectedOrder,
    } as OrderState,
  }
}

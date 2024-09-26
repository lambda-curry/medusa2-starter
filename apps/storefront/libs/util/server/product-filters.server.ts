import { StoreGetProductsParams } from "@markethaus/storefront-client"
import {
  FilterOptions,
  mergeFilterOptionsWithProductCounts,
} from "@libs/util/product-filters"
import { Medusa, createMedusaClient } from "@libs/util/server/client.server"
import { withProductFilterParams } from "@libs/util/remix/withProductFilterParams"
import { ProductFilterOptionsParams } from "@libs/util/medusa"

export const fetchFilterOptions: (
  client: Medusa,
  options?: ProductFilterOptionsParams,
) => Promise<FilterOptions> = async (client, options) => {
  const filterOptions = await client.filterOptions.retrieve(options)

  const collections = filterOptions.collections
    .filter((collection) => collection.product_count > 0)
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
  const tags = filterOptions.tags
    .filter((tag) => tag.product_count > 0)
    .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()))
  const types = filterOptions.types
    .filter((type) => type.product_count > 0)
    .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()))

  const categories = filterOptions.categories
    // .filter(category => category.product_count > 0)
    .sort((a, b) => (a.rank || 0) - (b.rank || 0))

  const order = options?.order

  return {
    collections,
    tags,
    types,
    categories,
    order,
  }
}

export const fetchDynamicFilterOptions = async (
  request: Request,
): Promise<{
  allFilterOptions: FilterOptions
  filterOptions: FilterOptions
  filterQuery: Partial<StoreGetProductsParams>
}> => {
  const client = await createMedusaClient({ request })

  const allFilterOptions = await fetchFilterOptions(client)

  const filters = withProductFilterParams({
    request,
    filterOptions: allFilterOptions,
  })

  let order: string | undefined = undefined
  if (Array.isArray(filters.selectedOrder)) {
    order = filters.selectedOrder[0]
  } else {
    order = filters.selectedOrder
  }

  const filterQuery = {
    collection_id: filters.selectedCollectionIds,
    category_id: filters.selectedCategoryIds,
    include_category_children: true,
    tags: filters.selectedTagIds,
    order: order,
  }

  const filterOptions = await fetchFilterOptions(client, {
    ...filterQuery,
  })

  const mergedFilterOptions = mergeFilterOptionsWithProductCounts(
    allFilterOptions,
    filterOptions,
  )

  return { allFilterOptions: mergedFilterOptions, filterOptions, filterQuery }
}

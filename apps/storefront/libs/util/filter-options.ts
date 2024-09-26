import { type Medusa } from "@libs/util/server/client.server"

export const fetchFilterOptions = async (client: Medusa) => {
  const filterOptions = await client.filterOptions.retrieve()
  const collections = filterOptions.collections
    .filter((collection) => collection.product_count > 0)
    .sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()))
  const tags = filterOptions.tags
    .filter((tag) => tag.product_count > 0)
    .sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()))
  const categories = filterOptions.categories
    .filter((category) => category.product_count > 0)
    .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

  return {
    collections,
    tags,
    categories,
  }
}

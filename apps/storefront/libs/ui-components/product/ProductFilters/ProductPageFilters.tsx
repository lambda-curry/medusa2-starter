import { FC, ReactNode, useState } from "react"
import { FilterOptions } from "@libs/util/product-filters"
import {
  FilterState,
  ProductPageFiltersHook,
  useProductPageFilters,
} from "../../hooks/useProductPageFilters"
import { Button } from "@ui-components/common/buttons"
import { Modal } from "@ui-components/common/modals/Modal"
import { ProductCategoriesList } from "./ProductCategories/ProductCategoriesList"
import { ProductCollectionsList } from "./ProductCollections/ProductCollectionsList"
import { ProductTagsList } from "./ProductTags/ProductTagsList"

interface FilterGroupProps extends FilterState {
  title: string
  items?: FilterOptions[keyof FilterOptions]
  children: ReactNode
}

const FilterGroup: FC<FilterGroupProps> = ({
  title,
  items,
  children,
  selected,
  clearSelected,
}) => {
  if (!items || items.length === 0) return null
  const hasSelected = selected && selected.length > 0
  return (
    <div className="border-1 h-fit w-full rounded-lg border border-gray-100 bg-white px-2 pb-2 pt-3">
      <div className="flex min-h-[28px] justify-between gap-2 px-2">
        <h3 className="text-xs font-bold text-gray-900">{title}</h3>
        {hasSelected && (
          <Button
            variant="link"
            className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => clearSelected()}
          >
            Clear
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}

const ProductFilters: FC<{ productPageFilters: ProductPageFiltersHook }> = ({
  productPageFilters,
}) => {
  const {
    allFilters: { categories, collections, tags },
    categoryFilterState,
    collectionFilterState,
    tagFilterState,
  } = productPageFilters

  return (
    <>
      <FilterGroup
        title="Collections"
        items={collections}
        {...collectionFilterState}
      >
        <ProductCollectionsList
          collections={collections}
          {...collectionFilterState}
        />
      </FilterGroup>
      <FilterGroup
        title="Categories"
        items={categories}
        {...categoryFilterState}
      >
        <ProductCategoriesList
          categories={categories}
          {...categoryFilterState}
        />
      </FilterGroup>
      <FilterGroup title="Tags" items={tags} {...tagFilterState}>
        <ProductTagsList tags={tags} {...tagFilterState} />
      </FilterGroup>
    </>
  )
}

export const ProductPageFilters: FC<{
  filterOptions: FilterOptions
  allFilterOptions: FilterOptions
}> = ({ filterOptions, allFilterOptions }) => {
  const productPageFilters = useProductPageFilters({
    filterOptions,
    allFilterOptions,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const activeFilterCount = Object.values(
    productPageFilters.filterQuery,
  ).reduce(
    (count, value) =>
      count + (Array.isArray(value) ? value.length : value ? 1 : 0),
    0,
  )
  const hasActiveFilters = activeFilterCount > 0
  const hasNoFilters = Object.values(allFilterOptions).every(
    (options) => !options?.length,
  )

  if (hasNoFilters) return null

  return (
    <>
      <div className="mb-4 hidden h-fit w-72 gap-2 sm:grid">
        <ProductFilters productPageFilters={productPageFilters} />
      </div>
      <div className="sm:hidden">
        <Button
          className={`w-full rounded-md p-2 text-sm font-medium ${
            hasActiveFilters
              ? "bg-primary-600 text-white"
              : "border border-gray-300 bg-white text-gray-800"
          }`}
          onClick={() => setIsModalOpen(true)}
        >
          {`Filters${hasActiveFilters ? ` (${activeFilterCount})` : ""}`}
        </Button>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {" "}
              {`Product Filters${
                hasActiveFilters ? ` (${activeFilterCount})` : ""
              }`}
            </h2>
          </div>

          <div className="my-2 grid h-fit w-full gap-2">
            <ProductFilters productPageFilters={productPageFilters} />
          </div>
        </Modal>
      </div>
    </>
  )
}

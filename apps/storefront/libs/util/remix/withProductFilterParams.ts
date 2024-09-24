import { FilterOptions } from '@marketplace/util/product-filters';
import { parseProductPageFilterSearchParams } from '../../ui-components/hooks/useProductPageFilters';

export const withProductFilterParams = ({
  request,
  filterOptions
}: {
  request: Request;
  filterOptions: FilterOptions;
}) => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const filterSearchParams = searchParams.get('filters');

  const productPageFilters = filterSearchParams ? parseProductPageFilterSearchParams(filterSearchParams) : undefined;

  const selectedCollections = filterOptions?.collections?.filter(c =>
    productPageFilters?.collections?.includes(c.handle!)
  );
  const selectedCollectionIds = selectedCollections?.map(c => c.id) || [];
  const selectedCategories = filterOptions?.categories?.filter(c => productPageFilters?.categories?.includes(c.handle));
  const selectedCategoryIds = selectedCategories?.map(c => c.id) || [];
  const selectedTags = filterOptions.tags?.filter(t => productPageFilters?.tags?.includes(t.value));
  const selectedTagIds = selectedTags?.map(t => t.id) || [];
  const selectedOrder = productPageFilters?.order ?? 'popularity';

  return {
    productPageFilters,
    selectedCollections,
    selectedCollectionIds,
    selectedCategories,
    selectedCategoryIds,
    selectedTags,
    selectedTagIds,
    selectedOrder
  };
};

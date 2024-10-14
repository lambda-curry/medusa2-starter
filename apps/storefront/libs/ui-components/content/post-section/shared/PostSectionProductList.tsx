import { buildSearchParamsFromObject } from '@libs/util/buildSearchParamsFromObject';
import type { ProductListContent, ProductListFilter } from '@libs/util/medusa/types';
import { useFetcher, useParams } from '@remix-run/react';
import clsx from 'clsx';
import { memo, useEffect, useState, type FC, type ReactNode } from 'react';
import { ProductCategoryTabs } from '../../../product/ProductCategoryTabs';
import { ProductCollectionTabs } from '../../../product/ProductCollectionTabs';
import type { ProductListProps } from '../../../product/ProductGrid';
import { ProductListHeader } from '../../../product/ProductListHeader';
import { Container } from '@ui-components/common/container/Container';
import { PostSectionBase, type SectionBaseProps } from './PostSectionBase';
import { StoreCollection, StoreProduct, StoreProductCategory } from '@medusajs/types';

export interface SectionProductListProps extends SectionBaseProps<ProductListContent> {
  className?: string;
  component: FC<ProductListProps>;
  fallback: ReactNode;
}

const SectionProductListBase: FC<SectionProductListProps> = ({ component, ...props }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<number | undefined>(undefined);
  const fetcher = useFetcher<{
    products: StoreProduct[];
    collection_tabs: StoreCollection[];
    category_tabs: StoreProductCategory[];
  }>();
  const params = useParams();

  const { collection_tabs, category_tabs, products } = fetcher.data || {};

  const filteredProducts = params.productHandle
    ? products?.filter((product) => product.handle !== params.productHandle)
    : products;

  const hasCollectionTabs = !!collection_tabs?.length;
  const hasCategoryTabs = !!category_tabs?.length;
  const hasProducts = isInitialized && !filteredProducts?.length;
  const ProductListComponent = component;

  const fetchData = (filters?: ProductListFilter) => {
    const queryString = buildSearchParamsFromObject({
      subloader: 'productList',
      data: JSON.stringify({
        content: filters,
      }),
    });

    fetcher.load(`/api/page-data?${queryString}`);
  };

  useEffect(() => {
    // // Don't fetch if we have data coming from loader, which is configured to only be passed on non-preview routes.

    if (fetcher.data || fetcher.state === 'loading') {
      return;
    }

    console.log('SectionProductListBase => fetching products...');

    fetchData(props.data?.filters);
  }, []);

  const handleTabChange = (index: number, type: 'collection' | 'category') => {
    if (type === 'collection') {
      const collection = collection_tabs?.[index - 1];
      setSelectedTab(index);
      fetchData({ collection_id: [collection?.id!] });
    }
    if (type === 'category') {
      const category = category_tabs?.[index - 1];
      setSelectedTab(index);
      fetchData({ category_id: [category?.id!] });
    }
  };

  useEffect(() => {
    if (!isInitialized && fetcher.data) {
      setIsInitialized(true);
    }
  }, [fetcher.data]);

  return (
    <>
      {hasCollectionTabs && (
        <div className="pb-6">
          <ProductCollectionTabs
            selectedIndex={selectedTab}
            collections={collection_tabs}
            onChange={(index) => handleTabChange(index, 'collection')}
          />
        </div>
      )}
      {hasCategoryTabs && (
        <div className="pb-6">
          <ProductCategoryTabs
            selectedIndex={selectedTab}
            categories={category_tabs}
            onChange={(index) => handleTabChange(index, 'category')}
          />{' '}
        </div>
      )}

      {hasProducts && (
        <div className="mb-8 mt-8">
          <h3 className="text-lg font-bold text-gray-900">
            There are no products to show
            {hasCollectionTabs || hasCategoryTabs ? ` in this ${hasCollectionTabs ? 'collection' : 'category'}.` : ''}
          </h3>
        </div>
      )}

      {!hasProducts && <ProductListComponent products={filteredProducts} />}
    </>
  );
};

export const SectionProductList: FC<SectionProductListProps> = memo((props) => {
  const { heading, text, actions } = props.data || {};

  return (
    <PostSectionBase {...props} className={clsx(`overflow-x-hidden`, props.className)}>
      <Container>
        <ProductListHeader heading={heading?.value} text={text} actions={actions} />
        <SectionProductListBase {...props} />
      </Container>
    </PostSectionBase>
  );
});

export default SectionProductList;

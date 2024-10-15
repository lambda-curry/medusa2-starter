import { buildSearchParamsFromObject } from '@libs/util/buildSearchParamsFromObject';
import type { CustomAction, ProductListFilter } from '@libs/types';
import { useFetcher, useParams } from '@remix-run/react';
import clsx from 'clsx';
import { HTMLAttributes, memo, useEffect, useState, type FC } from 'react';
import { ProductCategoryTabs } from '@app/components/product/ProductCategoryTabs';
import { ProductCollectionTabs } from '@app/components/product/ProductCollectionTabs';
import { ProductListHeader } from '@app/components/product/ProductListHeader';
import { Container } from '@app/components/common/container/Container';
import { StoreCollection, StoreProduct, StoreProductCategory } from '@medusajs/types';
import ProductCarousel from '@app/components/product/ProductCarousel';

export interface ProductListProps<TElement extends HTMLElement = HTMLDivElement> extends HTMLAttributes<TElement> {
  heading?: string;
  text?: string;
  actions?: CustomAction[];
  className?: string;
}
const ProductListBase: FC<{}> = () => {
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

    fetchData();
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

      {!hasProducts && <ProductCarousel products={filteredProducts} />}
    </>
  );
};

export const ProductList: FC<ProductListProps> = memo(({ className, heading, text, actions, ...props }) => {
  return (
    <section className={clsx(`mkt-section relative overflow-x-hidden`, className)} {...props}>
      <div className="mkt-section__inner relative z-[2]">
        <Container>
          <ProductListHeader heading={heading} text={text} actions={actions} />
          <ProductListBase {...props} />
        </Container>
      </div>
    </section>
  );
});

export default ProductList;

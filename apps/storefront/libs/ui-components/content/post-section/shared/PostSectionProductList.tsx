import { buildSearchParamsFromObject } from '@libs/util/buildSearchParamsFromObject';
import type {
  ProductCarouselPostSection,
  ProductCategory,
  ProductCollection,
  ProductGridPostSection,
  ProductWithReviews,
} from '@libs/util/medusa/types';
import { Await, useFetcher } from '@remix-run/react';
import clsx from 'clsx';
import {
  Suspense,
  memo,
  useEffect,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { useSessionStorage } from '../../../hooks/useLocalStorage';
import { ProductCategoryTabs } from '../../../product/ProductCategoryTabs';
import { ProductCollectionTabs } from '../../../product/ProductCollectionTabs';
import type { ProductListProps } from '../../../product/ProductGrid';
import { ProductListHeader } from '../../../product/ProductListHeader';
import { Container } from '@components/container/Container';
import { PostSectionBase, type PostSectionBaseProps } from './PostSectionBase';

export interface PostSectionProductListProps
  extends PostSectionBaseProps<
    ProductGridPostSection | ProductCarouselPostSection
  > {
  component: FC<ProductListProps>;
  fallback: ReactNode;
  data?: Promise<{
    products: ProductWithReviews[];
    collection_tabs: ProductCollection[];
    category_tabs: ProductCategory[];
  }>;
}

const PostSectionProductListBase: FC<
  Omit<PostSectionProductListProps, 'data'> & {
    data?: {
      products: ProductWithReviews[];
      collection_tabs: ProductCollection[];
      category_tabs: ProductCategory[];
    };
  }
> = ({ section, component, className, data, ...props }) => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<number | undefined>(undefined);
  const fetcher = useFetcher<{
    products: ProductWithReviews[];
    collection_tabs: ProductCollection[];
    category_tabs: ProductCategory[];
  }>();
  const [localData, setLocalData] = useSessionStorage<{
    products: ProductWithReviews[];
    collection_tabs: ProductCollection[];
    category_tabs: ProductCategory[];
  }>(`mkt_data_${section.id}`, data);

  const { collection_tabs, category_tabs, products } =
    fetcher.data || data || localData || {};

  const {
    product_filter,
    include_collection_tabs,
    include_category_tabs,
    product_select,
    product_id,
    collection_tab_id,
    category_tab_id,
  } = section.content;

  const hasCollectionTabs =
    product_select === 'filter' && !!collection_tabs?.length;
  const hasCategoryTabs =
    product_select === 'filter' && !!category_tabs?.length;
  const hasProducts = isInitialized && !products?.length;
  const ProductListComponent = component;

  const fetchData = (filters?: {
    collection_id?: string;
    category_id?: string;
  }) => {
    // Added category_id to the filters type
    const { collection_id, category_id } = filters || product_filter || {};

    const queryString = buildSearchParamsFromObject({
      subloader: 'productList',
      data: JSON.stringify({
        content: {
          product_select,
          product_id,
          include_collection_tabs,
          include_category_tabs,
          collection_tab_id,
          category_tab_id,
          product_filter: {
            ...(product_filter || {}),
            collection_id,
            category_id,
          },
        },
      }),
    });

    fetcher.load(`/api/post-section-data?${queryString}`);
  };

  useEffect(() => {
    // Don't fetch if we have data coming from loader, which is configured to only be passed on non-preview routes.

    if (data) {
      setLocalData(data);
      return;
    }

    fetchData();
  }, [section]);

  const handleTabChange = (index: number, type: 'collection' | 'category') => {
    if (type === 'collection') {
      const collection = collection_tabs?.[index - 1];
      setSelectedTab(index);
      fetchData({ collection_id: collection?.id });
    }
    if (type === 'category') {
      const category = category_tabs?.[index - 1];
      setSelectedTab(index);
      fetchData({ category_id: category?.id });
    }
  };

  useEffect(() => {
    if (!isInitialized && fetcher.data) {
      setIsInitialized(true);
    }
  }, [fetcher.data]);

  const isPreview =
    typeof window !== 'undefined' &&
    window?.location.pathname.includes('/preview');

  return (
    <>
      {hasCollectionTabs && (
        <div className="pb-6">
          <ProductCollectionTabs
            selectedIndex={selectedTab}
            collections={collection_tabs}
            onChange={index => handleTabChange(index, 'collection')}
          />
        </div>
      )}
      {hasCategoryTabs && (
        <div className="pb-6">
          <ProductCategoryTabs
            selectedIndex={selectedTab}
            categories={category_tabs}
            onChange={index => handleTabChange(index, 'category')}
          />{' '}
        </div>
      )}

      {hasProducts && (
        <div className="mb-8 mt-8">
          <h3 className="text-lg font-bold text-gray-900">
            There are no products to show
            {hasCollectionTabs || hasCategoryTabs
              ? ` in this ${hasCollectionTabs ? 'collection' : 'category'}.`
              : ''}
          </h3>
          {isPreview &&
            (hasCollectionTabs || hasCategoryTabs) &&
            Number.isInteger(selectedTab) && (
              <p className="mt-2 text-gray-500">
                Modify your filters to view products.
              </p>
            )}
        </div>
      )}

      {!hasProducts && <ProductListComponent products={products} />}
    </>
  );
};

export const PostSectionProductList: FC<PostSectionProductListProps> = memo(
  ({ data, ...props }) => {
    const { section, className } = props;
    const { heading, text, actions } = section.content;

    const [localData] = useSessionStorage<{
      products: ProductWithReviews[];
      collection_tabs: ProductCollection[];
      category_tabs: ProductCategory[];
    }>(`mkt_data_${section.id}`);

    const fallback = localData ? (
      <PostSectionProductListBase data={localData} {...props} />
    ) : (
      props.fallback
    );

    return (
      <PostSectionBase
        className={clsx(`overflow-x-hidden`, className)}
        {...props}
      >
        <Container>
          <ProductListHeader
            heading={heading?.value}
            text={text}
            actions={actions}
          />
          <Suspense fallback={fallback}>
            {!!data && (
              <Await resolve={data}>
                {data => <PostSectionProductListBase data={data} {...props} />}
              </Await>
            )}
            {!data && <PostSectionProductListBase {...props} />}
          </Suspense>
        </Container>
      </PostSectionBase>
    );
  }
);

export default PostSectionProductList;

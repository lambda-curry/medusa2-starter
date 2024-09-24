import {
  BlogListPostSection,
  Post,
  PostSectionType,
  PostType,
  PricedProduct,
  ProductCarouselPostSection,
  ProductCategory,
  ProductCollection,
  ProductGridPostSection,
  ProductListPostSectionContent
} from '@marketplace/util/medusa';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Params } from '@remix-run/react';
import { withProductsAndReviewStats } from './reviews.server';
import { withPaginationParams } from '@marketplace/util/remix';

export const getPost = async (loaderArgs: LoaderFunctionArgs) => {
  const { request, params } = loaderArgs;

  try {
    const client = await createMedusaClient({ request });
    const { post } = await client.posts.retrieve(params.postHandle ?? '');

    if (!post) return null;

    return post;
  } catch (error) {
    return null;
  }
};

export const getHomePage = async (loaderArgs: LoaderFunctionArgs) => {
  const { request } = loaderArgs;

  try {
    const client = await createMedusaClient({ request });

    const { post } = await client.posts.retrieveHomePage();

    if (!post) return null;

    return post;
  } catch (error) {
    return null;
  }
};

export type MappedDataSections = ProductGridPostSection | ProductCarouselPostSection | BlogListPostSection;

export const getBlogPostListData = async (section: BlogListPostSection, request: Request) => {
  const client = await createMedusaClient({ request });
  const prefix = `${section.id}_`;
  const { limit, offset, searchParams } = withPaginationParams({ request, prefix });

  const tagListQueryOptions = {
    type: PostType.POST,
    limit,
    offset
  };

  const { posts, count } = await client.posts.list(tagListQueryOptions);

  return { posts, count, prefix };
};

export const getProductListData = async (section: MappedDataSections, request: Request) => {
  const client = await createMedusaClient({ request });
  const {
    product_select,
    product_id,
    product_filter,
    include_collection_tabs,
    include_category_tabs,
    collection_tab_id,
    category_tab_id
  } = section.content as ProductListPostSectionContent;

  let products: PricedProduct[] = [];
  let collection_tabs: ProductCollection[] = [];
  let category_tabs: ProductCategory[] = [];

  if (product_select === 'id' && !!product_id?.length) {
    const data = await withProductsAndReviewStats(request, { id: product_id });
    products = data.products;
  }

  if (product_select === 'filter' && product_filter) {
    const data = await withProductsAndReviewStats(request, product_filter);
    products = data.products;

    if (include_collection_tabs || include_category_tabs) {
      const filterOptions = await client.filterOptions.retrieve();

      collection_tabs = filterOptions['collections'];
      if (include_collection_tabs) {
        collection_tabs = collection_tab_id?.length
          ? collection_tabs
              .filter(c => {
                const filterOption = filterOptions.collections.find(co => co.id === c.id);

                return collection_tab_id?.includes(c.id) && !!filterOption?.product_count;
              })
              .sort((a, b) => collection_tab_id?.indexOf(a.id) - collection_tab_id?.indexOf(b.id))
          : collection_tabs;
      } else {
        collection_tabs = [];
      }

      if (include_category_tabs) {
        category_tabs = filterOptions['categories'];
        category_tabs = category_tab_id?.length
          ? category_tabs
              .filter(c => {
                const filterOption = filterOptions.categories.find(co => co.id === c.id);

                // TODO: add product count filter back when product count is added to category filter options
                return category_tab_id?.includes(c.id); // && !!filterOption?.product_count;
              })
              .sort((a, b) => category_tab_id?.indexOf(a.id) - category_tab_id?.indexOf(b.id))
          : category_tabs;
      } else {
        category_tabs = [];
      }
    }
  }

  return { products, collection_tabs, category_tabs };
};

export interface PostDataArgs {
  post: Post;
  request: Request;
  params: Params<string>;
}

const PostSectionDataMap: Record<string, (section: any, request: Request) => Promise<any>> = {
  [PostSectionType.PRODUCT_CAROUSEL]: getProductListData,
  [PostSectionType.PRODUCT_GRID]: getProductListData,
  [PostSectionType.BLOG_LIST]: getBlogPostListData
} as const;

export const fetchPostData = ({ post, request, params }: PostDataArgs): Record<string, Promise<any>> => {
  if (!post) return {};

  return post.sections.reduce((acc, section) => {
    if (!(section.type in PostSectionDataMap)) return acc;

    const data = PostSectionDataMap[section.type](section, request);
    if (data) acc[section.id] = data;
    return acc;
  }, {} as Record<string, Promise<any>>);
};

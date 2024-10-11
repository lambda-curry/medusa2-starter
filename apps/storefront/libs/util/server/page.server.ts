import { home as homePage } from '@libs/config/pages/home';
import { BasePageSection } from '@libs/util/medusa/types';
import {
  HttpTypes,
  StoreCollection,
  StoreProductCategory,
} from '@medusajs/types';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { getSelectedRegion } from './data/regions.server';
import { fetchProducts } from './products.server';

export const getHomePage = async (loaderArgs: LoaderFunctionArgs) => {
  const { request } = loaderArgs;

  return homePage;
};

export type MappedDataSections = BasePageSection<any>; // TODO: CHECK IF THIS IS STILL REQUIRED

export const getProductListData = async (request: Request) => {
  const region = await getSelectedRegion(request.headers);

  const productsQuery: HttpTypes.StoreProductParams = {
    limit: 10,
    offset: 0,
  };

  const { products } = await fetchProducts(request, {
    ...productsQuery,
    region_id: region.id,
    fields: 'id,title,handle,thumbnail,variants.*,variants.prices.*',
  });
  const collectionTabs = new Map<string, StoreCollection>();
  const categoryTabs = new Map<string, StoreProductCategory>();

  products.forEach(product => {
    product?.categories?.forEach(category => {
      categoryTabs.set(category.id, category);
    });

    if (product.collection) {
      collectionTabs.set(product.collection.id, product.collection);
    }
  });

  return {
    products,
    collection_tabs: [...collectionTabs.values()],
    category_tabs: [...categoryTabs.values()],
  };
};

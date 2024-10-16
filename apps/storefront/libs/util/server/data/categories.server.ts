import { sdk } from '@libs/util/server/client.server';
import { StoreProductCategoryParams } from '@medusajs/types';

export const listCategories = async function () {
  return sdk.store.category.list({ fields: '+category_children' }).then(({ product_categories }) => product_categories);
};

export const getCategoryByHandle = async function (categoryHandle: string[]) {
  return sdk.store.category
    .list({
      handle: categoryHandle,
    } as StoreProductCategoryParams)
    .then(({ product_categories }) => product_categories[0]);
};

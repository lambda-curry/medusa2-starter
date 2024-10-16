import { type ActionHandler, handleAction } from '@libs/util/handleAction.server';
import { getVariantBySelectedOptions } from '@libs/util/products';
import { setCartId } from '@libs/util/server/cookies.server';
import { addToCart, deleteLineItem, retrieveCart, updateLineItem } from '@libs/util/server/data/cart.server';
import { getProductsById } from '@libs/util/server/data/products.server';
import { getSelectedRegion } from '@libs/util/server/data/regions.server';
import { FormValidationError } from '@libs/util/validation/validation-error';
import { StoreCart, StoreCartResponse } from '@medusajs/types';
import type { ActionFunctionArgs } from '@remix-run/node';
import { data as remixData } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';

export const addCartItemValidation = withYup(
  Yup.object().shape({
    productId: Yup.string().required(),
    options: Yup.object().default({}),
    quantity: Yup.number().required(),
  }),
);

export enum LineItemActions {
  CREATE = 'createItem',
  UPDATE = 'updateItem',
  DELETE = 'deleteItem',
}

export interface CreateLineItemPayLoad {
  cartId: string;
  productId: string;
  options: { [key: string]: string };
  quantity: string;
}

export interface UpdateLineItemRequestPayload {
  cartId: string;
  lineItemId: string;
  quantity: string;
}

export interface DeleteLineItemRequestPayload {
  cartId: string;
  lineItemId: string;
}

export interface LineItemRequestResponse extends StoreCartResponse {}

const createItem: ActionHandler<StoreCartResponse> = async (payload: CreateLineItemPayLoad, { request }) => {
  const result = await addCartItemValidation.validate(payload);

  if (result.error) throw new FormValidationError(result.error);

  const { productId, options, quantity } = payload;

  const region = await getSelectedRegion(request.headers);

  const [product] = await getProductsById({
    ids: [productId],
    regionId: region.id,
  }).catch(() => []);

  if (!product)
    throw new FormValidationError({
      fieldErrors: { formError: 'Product not found.' },
    });

  const variant = getVariantBySelectedOptions(product.variants || [], options);

  if (!variant)
    throw new FormValidationError({
      fieldErrors: {
        formError: 'Product variant not found. Please select all required options.',
      },
    });

  const responseHeaders = new Headers();

  const { cart } = await addToCart(request, {
    variantId: variant.id!,
    quantity: parseInt(quantity, 10),
  });

  await setCartId(responseHeaders, cart.id);

  return remixData({ cart }, { headers: responseHeaders });
};

const updateItem: ActionHandler<StoreCartResponse> = async (
  { lineItemId, cartId, quantity }: UpdateLineItemRequestPayload,
  { request },
) => {
  return await updateLineItem(request, {
    lineId: lineItemId,
    quantity: parseInt(quantity, 10),
  });
};

const deleteItem: ActionHandler<StoreCartResponse> = async (
  { lineItemId, cartId }: DeleteLineItemRequestPayload,
  { request },
) => {
  await deleteLineItem(request, lineItemId);

  const cart = (await retrieveCart(request)) as StoreCart;

  return { cart };
};

const actions = {
  createItem,
  updateItem,
  deleteItem,
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleAction({
    actionArgs,
    actions,
  });
}

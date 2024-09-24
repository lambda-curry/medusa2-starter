import { FormValidationError } from '@utils/validation/validation-error';
import {
  V2ActionHandler,
  handleActionV2,
} from '@marketplace/util/handleAction.server';
import {
  createMedusaClient,
  type Medusa,
} from '@marketplace/util/medusa/client.server';
import { getVariantBySelectedOptions } from '@marketplace/util/products';
import { cartIdCookie } from '@marketplace/util/server/cart-session.server';
import { setCookie } from '@marketplace/util/server/cookies.server';
import type { StoreCartsRes } from '@markethaus/storefront-client';
import type { ActionFunctionArgs, NodeOnDiskFile } from '@remix-run/node';
import { unstable_data as data } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';

export const addCartItemValidation = withYup(
  Yup.object().shape({
    productId: Yup.string().required(),
    options: Yup.object().default({}),
    quantity: Yup.number().required(),
    customer_product_response: Yup.string(),
    customer_file_uploads: Yup.array().of(Yup.mixed()).optional(),
  })
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
  customer_product_response: string;
  customer_file_uploads: NodeOnDiskFile[] | [];
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

const uploadImages = async (
  images: NodeOnDiskFile[] | NodeOnDiskFile | null | undefined,
  client: Medusa
): Promise<
  {
    url: string;
    key: string;
  }[]
> => {
  if (!images) return [];
  const imagesToUpload = Array.isArray(images) ? images : [images];
  if (!imagesToUpload || imagesToUpload.length === 0) return [];
  const uploadResponse = await client.productReviews.uploadImages(
    imagesToUpload
  );
  if (!uploadResponse) return [];
  const uploads = uploadResponse.uploads;

  return Array.isArray(uploads) ? uploads : [{ ...uploads }];
};

export interface LineItemRequestResponse extends StoreCartsRes {}

const createItem: V2ActionHandler<StoreCartsRes> = async (
  payload: CreateLineItemPayLoad,
  { request }
) => {
  const client = await createMedusaClient({ request });

  const result = await addCartItemValidation.validate(payload);

  if (result.error) throw new FormValidationError(result.error);

  let cartId = await cartIdCookie.parse(request.headers.get('Cookie') || '');

  const {
    productId,
    options,
    quantity,
    customer_product_response,
    customer_file_uploads,
  } = payload;

  const { product } = await client.products.retrieve(productId, {});

  if (!product)
    throw new FormValidationError({
      fieldErrors: { formError: 'Product not found.' },
    });

  const variant = getVariantBySelectedOptions(product.variants, options);

  if (!variant)
    throw new FormValidationError({
      fieldErrors: {
        formError:
          'Product variant not found. Please select all required options.',
      },
    });

  const customerProductResponse =
    customer_product_response && customer_product_response.length > 0
      ? customer_product_response
      : null;

  const files = await uploadImages(customer_file_uploads, client);

  const responseHeaders = new Headers();

  if (!cartId) {
    const { cart } = await client.carts.create({});
    cartId = cart.id;
    await setCookie(responseHeaders, cartIdCookie, cartId);
  }

  const { cart } = await client.carts.createLineItem(cartId, {
    variant_id: variant.id!,
    quantity: parseInt(quantity, 10),
    // @ts-ignore
    customer_product_response: customerProductResponse,
    customer_file_uploads: files.map(({ url, key }) => ({
      url,
      name: key,
      alt: 'image uploaded by customer',
    })),
  });

  return data({ cart }, { headers: responseHeaders });
};

const updateItem: V2ActionHandler<StoreCartsRes> = async (
  { lineItemId, cartId, quantity }: UpdateLineItemRequestPayload,
  { request }
) => {
  const client = await createMedusaClient({ request });

  const { cart } = await client.carts.updateLineItem(cartId, lineItemId, {
    quantity: parseInt(quantity, 10),
  });

  return { cart };
};

const deleteItem: V2ActionHandler<StoreCartsRes> = async (
  { lineItemId, cartId }: DeleteLineItemRequestPayload,
  { request }
) => {
  const client = await createMedusaClient({ request });

  const { cart } = await client.carts.deleteLineItem(cartId, lineItemId);

  return { cart };
};

const actions = {
  createItem,
  updateItem,
  deleteItem,
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleActionV2({
    actionArgs,
    actions,
  });
}

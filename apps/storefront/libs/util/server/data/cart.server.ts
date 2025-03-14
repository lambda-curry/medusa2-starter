import { medusaError } from '@libs/util/medusaError';
import { sdk } from '@libs/util/server/client.server';
import { HttpTypes } from '@medusajs/types';
import omit from 'lodash.omit';
import { withAuthHeaders } from '../auth.server';
import { getCartId } from '../cookies.server';
import { getProductsById } from './products.server';
import { getSelectedRegion } from './regions.server';

export const retrieveCart = withAuthHeaders(async (request, authHeaders) => {
  const cartId = await getCartId(request.headers);

  if (!cartId) {
    return null;
  }

  return await sdk.store.cart
    .retrieve(cartId, {}, authHeaders)
    .then(({ cart }) => cart)
    .catch(() => {
      return null;
    });
});

export const createCart = withAuthHeaders(async (request, authHeaders, data: HttpTypes.StoreCreateCart) => {
  return await sdk.store.cart.create({ ...data }, {}, authHeaders);
});

export const getOrCreateCart = withAuthHeaders(async (request, authHeaders) => {
  let cart = await retrieveCart(request);

  const region = await getSelectedRegion(request.headers);

  if (!region) {
    throw new Error(`Selected Region not found`);
  }

  if (!cart) {
    const cartResp = await sdk.store.cart.create({ region_id: region.id });
    cart = cartResp.cart;
  }

  if (cart && cart?.region_id !== region.id) {
    await sdk.store.cart.update(cart.id, { region_id: region.id }, {}, authHeaders);
  }

  return cart;
});

export const updateCart = withAuthHeaders(async (request, authHeaders, data: HttpTypes.StoreUpdateCart) => {
  const cartId = await getCartId(request.headers);
  if (!cartId) {
    throw new Error('No existing cart found, please create one before updating');
  }

  return sdk.store.cart.update(cartId, data, {}, authHeaders).catch(medusaError);
});

export const addToCart = withAuthHeaders(
  async (
    request,
    authHeaders,
    data: {
      variantId: string;
      quantity: number;
    },
  ) => {
    const { variantId, quantity } = data;

    if (!variantId) {
      throw new Error('Missing variant ID when adding to cart');
    }

    const cartId = await getCartId(request.headers);

    if (cartId) {
      return await sdk.store.cart.createLineItem(
        cartId,
        {
          variant_id: variantId,
          quantity,
        },
        {},
        authHeaders,
      );
    }

    const region = await getSelectedRegion(request.headers);

    const cart = await createCart(request, { region_id: region.id, items: [{ variant_id: variantId, quantity }] });

    return cart;
  },
);

export const updateLineItem = withAuthHeaders(
  async (
    request,
    authHeaders,
    {
      lineId,
      quantity,
    }: {
      lineId: string;
      quantity: number;
    },
  ) => {
    if (!lineId) {
      throw new Error('Missing lineItem ID when updating line item');
    }

    const cartId = await getCartId(request.headers);
    if (!cartId) {
      throw new Error('Missing cart ID when updating line item');
    }

    return await sdk.store.cart.updateLineItem(cartId, lineId, { quantity }, {}, authHeaders).catch(medusaError);
  },
);

export const deleteLineItem = withAuthHeaders(async (request, authHeaders, lineId: string) => {
  if (!lineId) {
    throw new Error('Missing lineItem ID when deleting line item');
  }

  const cartId = await getCartId(request.headers);
  if (!cartId) {
    throw new Error('Missing cart ID when deleting line item');
  }

  return await sdk.store.cart.deleteLineItem(cartId, lineId, authHeaders).catch(medusaError);
});

export async function enrichLineItems(
  lineItems: HttpTypes.StoreCartLineItem[] | HttpTypes.StoreOrderLineItem[] | null,
  regionId: string,
) {
  if (!lineItems?.length) return [];

  // Prepare query parameters
  const queryParams = {
    ids: lineItems.map((lineItem) => lineItem.product_id!),
    regionId: regionId,
  };

  // Fetch products by their IDs
  const products = await getProductsById(queryParams);
  // If there are no line items or products, return an empty array
  if (!products?.length) {
    return [];
  }

  // Enrich line items with product and variant information
  const enrichedItems = lineItems.map((item) => {
    const product = products.find((p: any) => p.id === item.product_id);
    const variant = product?.variants?.find((v: any) => v.id === item.variant_id);

    // If product or variant is not found, return the original item
    if (!product || !variant) {
      return item;
    }

    // If product and variant are found, enrich the item
    return {
      ...item,
      variant: {
        ...variant,
        product: omit(product, 'variants'),
      },
    };
  }) as HttpTypes.StoreCartLineItem[];

  return enrichedItems;
}

export const setShippingMethod = withAuthHeaders(
  async (
    request,
    authHeaders,
    {
      cartId,
      shippingOptionId,
    }: {
      cartId: string;
      shippingOptionId: string;
    },
  ) => {
    return sdk.store.cart
      .addShippingMethod(cartId, { option_id: shippingOptionId }, {}, authHeaders)
      .catch(medusaError);
  },
);

export const initiatePaymentSession = withAuthHeaders(
  async (
    request,
    authHeaders,
    cart: HttpTypes.StoreCart,
    data: {
      provider_id: string;
      data?: Record<string, unknown>;
    },
  ) => {
    return sdk.store.payment.initiatePaymentSession(cart, data, {}, authHeaders).catch(medusaError);
  },
);

export const placeOrder = withAuthHeaders(async (request: Request, authHeaders) => {
  const cartId = await getCartId(request.headers);
  if (!cartId) {
    throw new Error('No existing cart found when placing an order');
  }

  const cartRes = await sdk.store.cart.complete(cartId, {}, authHeaders).catch(medusaError);

  return cartRes;
});

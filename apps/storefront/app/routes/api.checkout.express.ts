import { zodResolver } from '@hookform/resolvers/zod';
import { addressToMedusaAddress } from '@libs/util/addresses';
import { removeCartId } from '@libs/util/server/cookies.server';
import {
  ensureStripePaymentSession,
  placeOrder,
  retrieveCart,
  setShippingMethod,
  updateCart,
} from '@libs/util/server/data/cart.server';
import { listCartShippingOptions } from '@libs/util/server/data/fulfillment.server';
import type { StoreCart, StoreCartShippingOption, StoreOrder } from '@medusajs/types';
import type { ActionFunctionArgs } from 'react-router';
import { getValidatedFormData } from 'remix-hook-form';
import { z } from 'zod';

const addressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  countryCode: z.string().min(1, 'Country is required'),
  postalCode: z.coerce.string().min(1, 'Postal code is required'),
  phone: z.coerce.string().optional(),
  country: z.string().optional(),
});

export const expressCheckoutSchema = z.object({
  cartId: z.string(),
  email: z.string().email('Please enter a valid email').optional(),
  shippingAddress: addressSchema.optional().nullable(),
  billingAddress: addressSchema.optional().nullable(),
  complete: z.boolean().optional(),
  shippingOptions: z.array(z.string()).optional(),
});

export type ExpressCheckoutFormData = z.infer<typeof expressCheckoutSchema>;
type ExpressCheckoutFormInput = z.input<typeof expressCheckoutSchema>;

export interface ExpressCheckoutResponse {
  cart: StoreCart;
  order?: StoreOrder;
  shippingOptions: StoreCartShippingOption[];
}

export async function action(actionArgs: ActionFunctionArgs) {
  const { errors, data } = await getValidatedFormData<ExpressCheckoutFormInput, any, ExpressCheckoutFormData>(
    actionArgs.request,
    zodResolver(expressCheckoutSchema),
  );

  if (errors) return Response.json({ errors }, { status: 400 });

  let cart = await retrieveCart(actionArgs.request);

  if (!cart)
    return Response.json(
      { errors: { root: { message: 'Cart could not be retrieved. Please try again.' } } },
      { status: 400 },
    );

  if (data.shippingAddress || data.billingAddress || data.email) {
    const { cart: updatedCart } = await updateCart(actionArgs.request, {
      email: data.email ? data.email : undefined,
      shipping_address: data.shippingAddress ? addressToMedusaAddress(data.shippingAddress) : undefined,
      billing_address: data.billingAddress ? addressToMedusaAddress(data.billingAddress) : undefined,
    });

    cart = updatedCart;
  }

  if (data.shippingOptions) {
    await Promise.all(
      data.shippingOptions.map(
        async (id: string) =>
          await setShippingMethod(actionArgs.request, {
            cartId: data.cartId,
            shippingOptionId: id,
          }),
      ),
    );

    cart = await ensureStripePaymentSession(actionArgs.request, cart!);
  }

  if (data.complete) {
    const cartResponse = await placeOrder(actionArgs.request);

    if (cartResponse.type === 'cart' || !cartResponse) {
      return Response.json(
        { errors: { root: { message: 'Cart could not be completed. Please try again.' } } },
        { status: 400 },
      );
    }

    const headers = new Headers();

    await removeCartId(headers);

    const { order } = cartResponse;

    return Response.json({ order }, { headers });
  }

  cart = await ensureStripePaymentSession(actionArgs.request, cart!);

  const shippingOptions = await listCartShippingOptions(data.cartId);

  return Response.json({
    cart,
    shippingOptions,
  });
}

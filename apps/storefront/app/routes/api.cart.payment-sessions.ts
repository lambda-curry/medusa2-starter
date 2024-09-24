import { V2ActionHandler, handleActionV2 } from '@marketplace/util/handleAction.server';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import type { StoreCartsRes } from '@markethaus/storefront-client';
import type { ActionFunctionArgs } from '@remix-run/node';

export enum PaymentSessionActions {
  CREATE = 'createItem'
}

export interface PaymentSessionRequestPayload {
  cartId: string;
}

export type PaymentSessionRequestResponse = Promise<StoreCartsRes>;

const createItem: V2ActionHandler<StoreCartsRes> = async (
  { cartId }: PaymentSessionRequestPayload,
  { request }
): PaymentSessionRequestResponse => {
  const client = await createMedusaClient({ request });

  if (!cartId) throw new Error('Missing cartId');

  const { cart } = await client.carts.retrieve(cartId);

  if (!cart) throw new Error('Cart not found.');

  const { cart: updatedCart } = await client.carts.createPaymentSessions(cartId);

  if (!updatedCart.payment_session && updatedCart.payment_sessions.length) {
    const { cart } = await client.carts.setPaymentSession(cartId, {
      provider_id: updatedCart.payment_sessions[0].provider_id
    });
    return { cart };
  }

  return { cart: updatedCart };
};

const actions = {
  createItem
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleActionV2({ actionArgs, actions });
}

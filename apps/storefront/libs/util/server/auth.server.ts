import { createMedusaClient, Medusa } from '@marketplace/util/medusa/client.server';
import { getCartSession } from './cart-session.server';
import { Customer } from '@markethaus/storefront-client';
import { createCookie } from '@remix-run/node';
import { setCookie } from './cookies.server';
import jwt from 'jsonwebtoken';
import { config } from './config.server';

export const authCookie = createCookie(config.AUTH_COOKIE_NAME);

export const authenticateCustomer = async (
  data: { email: string; password: string },
  client: Medusa,
  request: Request
): Promise<{ customer_id: Customer['id']; headers: Headers; client: Medusa }> => {
  const { email, password } = data;

  try {
    const clientHeaders = new Headers();
    const serverHeaders = new Headers(request.headers);

    const { access_token } = await client.auth.getToken({ email, password });

    if (!access_token) throw Error('No access token received from authentication');

    const decoded = jwt.decode(access_token) as { customer_id: string };

    const customer_id = decoded.customer_id;

    const cartSession = await getCartSession(request.headers);

    setCookie(clientHeaders, authCookie, access_token!);

    if (cartSession.cartId) await client.carts.update(cartSession.cartId, { customer_id });

    // Create a new client with the updated headers for immediate authentication on the server.
    const newClient = await createMedusaClient({ request: { headers: serverHeaders } });

    return { customer_id, headers: clientHeaders, client: newClient };
  } catch (error: any) {
    throw error;
  }
};

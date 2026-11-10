import { timingSafeEqual } from 'node:crypto';
import { sdkCache } from '@libs/util/server/client.server';
import type { ActionFunctionArgs } from 'react-router';

/**
 * Clears this server's cached Medusa data, so the next page load shows current products. Medusa calls it when a
 * product changes. Disabled unless STOREFRONT_REVALIDATE_SECRET is set, and the caller must send that secret.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const secret = process.env.STOREFRONT_REVALIDATE_SECRET;
  const sent = request.headers.get('x-revalidate-secret') ?? '';
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });
  if (!secret || sent.length !== secret.length || !timingSafeEqual(Buffer.from(sent), Buffer.from(secret))) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  sdkCache.clear();
  return Response.json({ revalidated: true });
};

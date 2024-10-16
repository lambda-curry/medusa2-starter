import { sdk } from '@libs/util/server/client.server';
import { withAuthHeaders } from '../auth.server';
import { medusaError } from '@libs/util/medusaError';

export const retrieveOrder = withAuthHeaders(async (request, authHeaders, id: string) => {
  return sdk.store.order
    .retrieve(id, { fields: '*payment_collections.payments' }, authHeaders)
    .then(({ order }) => order)
    .catch(medusaError);
});

export const listOrders = withAuthHeaders(async (request, authHeaders, limit: number = 10, offset: number = 0) => {
  return sdk.store.order
    .list({ limit, offset }, authHeaders)
    .then(({ orders }) => orders)
    .catch(medusaError);
});

import { sdk } from '@libs/util/server/client.server';
import { HttpTypes } from '@medusajs/types';
import { withAuthHeaders } from '../auth.server';
import { medusaError } from '@libs/util/medusaError';

export const getCustomer = withAuthHeaders(async (request, authHeaders) => {
  return await sdk.store.customer
    .retrieve({}, authHeaders)
    .then(({ customer }) => customer)
    .catch(() => null);
});

export const updateCustomer = withAuthHeaders(async (request, authHeaders, body: HttpTypes.StoreUpdateCustomer) => {
  const updateRes = await sdk.store.customer
    .update(body, {}, authHeaders)
    .then(({ customer }) => customer)
    .catch(medusaError);

  return updateRes;
});

import { addressToMedusaAddress } from '@libs/util/addresses';
import { FormValidationError } from '@libs/util/validation/validation-error';
import type { ActionFunctionArgs } from '@remix-run/node';
import type { UpdateAccountDetailsInput } from '@app/routes/api.checkout';
import { checkoutAccountDetailsValidator } from '@app/components/checkout';
import type { StoreCart, StoreCartAddress } from '@medusajs/types';
import { updateCart } from './data/cart.server';

export const _updateAccountDetails = async (
  data: UpdateAccountDetailsInput,
  actionArgs: ActionFunctionArgs,
): Promise<{ cart: StoreCart; headers?: Headers }> => {
  const result = await checkoutAccountDetailsValidator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  return await updateGuestAccountDetails(data, actionArgs);
};

export const updateGuestAccountDetails = async (
  data: UpdateAccountDetailsInput,
  actionArgs: ActionFunctionArgs,
): Promise<{ cart: StoreCart; headers?: Headers }> => {
  const { request } = actionArgs;

  const formattedShippingAddress = addressToMedusaAddress(data.shippingAddress) as StoreCartAddress;

  const { cart } = await updateCart(request, {
    email: data.email,
    shipping_address: formattedShippingAddress,
    billing_address: formattedShippingAddress,
  });

  return { cart };
};

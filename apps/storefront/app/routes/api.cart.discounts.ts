import {
  V2ActionHandler,
  handleActionV2,
} from '@marketplace/util/handleAction.server';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import type { StoreCartsRes } from '@markethaus/storefront-client';
import type { ActionFunctionArgs } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { FormValidationError } from '@utils/validation/validation-error';
import { ValidationErrorData } from '@utils/validation/validation-response';

export enum CartDiscountAction {
  deleteItem = 'deleteItem',
}

const deleteDiscountValidation = {
  code: Yup.string().required(),
  cartId: Yup.string().required(),
};

const deleteItem: V2ActionHandler<StoreCartsRes | ValidationErrorData> = async (
  payload,
  { request }
) => {
  const client = await createMedusaClient({ request });
  const validator = withYup(Yup.object().shape(deleteDiscountValidation));

  const result = await validator.validate(payload);

  if (result.error) throw new FormValidationError(result.error);

  const { code, cartId } = result.data;

  const { cart } = await client.carts.deleteDiscount(cartId, code);

  return { cart };
};

const actions: {
  [key in CartDiscountAction]: V2ActionHandler<
    StoreCartsRes | ValidationErrorData
  >;
} = {
  deleteItem,
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleActionV2({ actionArgs, actions });
}

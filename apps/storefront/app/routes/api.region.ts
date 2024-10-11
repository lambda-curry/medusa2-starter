import {
  handleActionV2,
  V2ActionHandler,
} from '@libs/util/handleAction.server';
import {
  getCartId,
  setSelectedRegionId,
} from '@libs/util/server/cookies.server';
import { updateCart } from '@libs/util/server/data/cart.server';
import { retrieveRegion } from '@libs/util/server/data/regions.server';
import { ActionFunctionArgs, unstable_data } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import { validationError } from 'remix-validated-form';
import * as Yup from 'yup';

export enum RegionActions {
  CHANGE_REGION = 'changeRegion',
}

export const changeRegionValidator = withYup(
  Yup.object().shape({
    regionId: Yup.string().required(),
  })
);

const changeRegion: V2ActionHandler = async (
  data: { regionId: string },
  { request }
) => {
  const result = await changeRegionValidator.validate(data);
  if (result.error) return validationError(result.error);

  try {
    const { regionId } = result.data;

    await retrieveRegion(regionId);

    const headers = new Headers();

    await setSelectedRegionId(headers, regionId);

    const cartId = await getCartId(headers);

    if (cartId) await updateCart(request, { region_id: regionId });

    return unstable_data({ success: true }, { headers });
  } catch (error: any) {
    return unstable_data(error.response.data, {
      status: error.response.status,
    });
  }
};

const actions = {
  changeRegion,
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  return await handleActionV2({
    actionArgs,
    actions,
  });
};

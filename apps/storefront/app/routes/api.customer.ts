import {
  V2ActionHandler,
  handleActionV2,
} from '@marketplace/util/handleAction.server';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import {
  confirmPasswordValidation,
  emailAddressValidation,
} from '@marketplace/util/validation';
import { ActionFunctionArgs, json } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import { validationError } from 'remix-validated-form';
import * as Yup from 'yup';
import { FormValidationError } from '@utils/validation/validation-error';

export enum CustomerAction {
  GENERATE_RESET_PASSWORD_TOKEN = 'generatePasswordResetToken',
  RESET_PASSWORD = 'resetPassword',
  DELETE_SHIPPING_ADDRESS = 'deleteShippingAddress',
  DELETE_PAYMENT_METHOD = 'deletePaymentMethod',
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  password: string;
}

export const forgotPasswordFormValidator = withYup(
  Yup.object().shape({
    ...emailAddressValidation,
  })
);

export const resetPasswordFormValidator = withYup(
  Yup.object().shape({
    ...confirmPasswordValidation,
    password: Yup.string().required('Password is required'),
  })
);

const generatePasswordResetToken: V2ActionHandler = async (
  data: ForgotPasswordInput,
  { request }
) => {
  const client = await createMedusaClient({ request });

  const result = await forgotPasswordFormValidator.validate(data);

  if (result.error) new FormValidationError(result.error);

  try {
    await client.customers.generatePasswordToken({ email: data.email });

    return json({
      type: 'success',
      message: 'Password generated',
      email: data.email,
    });
  } catch (ex: any) {
    return json(ex.response.data, { status: ex.response.status });
  }
};

const resetPassword: V2ActionHandler = async (
  data: ResetPasswordInput,
  actionArgs
) => {
  const client = await createMedusaClient(actionArgs);

  const result = await resetPasswordFormValidator.validate(data);

  if (result.error) new FormValidationError(result.error);

  try {
    const { customer } = await client.customers.resetPassword({
      email: data.email,
      token: data.token,
      password: data.password,
    });

    return json({ type: 'success', message: 'Password updated', customer });
  } catch (ex: any) {
    return json(ex.response.data, { status: ex.response.status });
  }
};

const deleteShippingAddress: V2ActionHandler = async (
  { shippingAddressId }: { shippingAddressId: string },
  { request }
) => {
  const client = await createMedusaClient({ request });

  if (!shippingAddressId)
    return json(
      { type: 'error', message: 'Shipping address ID is required' },
      { status: 400 }
    );

  try {
    const { customer } = await client.customers.deleteAddress(
      shippingAddressId
    );

    return { customer };
  } catch (ex: any) {
    return json(ex.response.data, { status: ex.response.status });
  }
};

const deletePaymentMethod: V2ActionHandler = async (
  {
    paymentProviderId,
    paymentMethodId,
  }: { paymentProviderId: string; paymentMethodId: string },
  { request }
) => {
  const client = await createMedusaClient({ request });

  if (!paymentProviderId)
    return json(
      { type: 'error', message: 'Payment provider ID is required' },
      { status: 400 }
    );
  if (!paymentMethodId)
    return json(
      { type: 'error', message: 'Payment method ID is required' },
      { status: 400 }
    );

  try {
    // @ts-ignore - We don't really support saved payment methods anymore.
    const { customer } = await client.customers.paymentMethods.delete(
      paymentProviderId,
      paymentMethodId
    );

    return { customer };
  } catch (ex: any) {
    return json(ex.response.data, { status: ex.response.status });
  }
};

const actions = {
  generatePasswordResetToken,
  resetPassword,
  deleteShippingAddress,
  deletePaymentMethod,
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  const data = await handleActionV2({
    actionArgs,
    actions,
  });

  return data;
};

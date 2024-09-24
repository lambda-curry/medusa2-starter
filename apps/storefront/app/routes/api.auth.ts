import {
  V2ActionHandler,
  handleActionV2,
} from '@marketplace/util/handleAction.server';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { emailAddressValidation } from '@marketplace/util/validation';
import {
  redirect,
  unstable_data as data,
  ActionFunctionArgs,
} from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { loginFormValidator } from '~/components/auth/LoginForm';
import {
  authCookie,
  authenticateCustomer,
} from '@marketplace/util/server/auth.server';
import { destroyCartSession } from '@marketplace/util/server/cart-session.server';
import { destroyCookie } from '@marketplace/util/server/cookies.server';
import { FormValidationError } from '@utils/validation/validation-error';
import { ValidationErrorData } from '@utils/validation/validation-response';
import { Customer } from '@marketplace/util/medusa';

export enum AuthAction {
  CHECK_EMAIL = 'checkEmail',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

const checkEmail: V2ActionHandler<
  { exists: boolean } | ValidationErrorData
> = async ({ email }: { email: string }, { request }) => {
  const client = await createMedusaClient({ request });

  const validator = withYup(Yup.object().shape(emailAddressValidation));

  const result = await validator.validate({ email });

  if (result.error) throw new FormValidationError(result.error);

  const { exists } = await client.auth.exists(email);

  if (exists)
    throw new FormValidationError({
      fieldErrors: { formError: 'Email is already in use.' },
    });

  return { exists };
};

const login: V2ActionHandler<
  ValidationErrorData | { customer_id: string }
> = async (payload: object, { request }) => {
  const client = await createMedusaClient({ request });

  const result = await loginFormValidator.validate(payload);

  if (result.error) throw new FormValidationError(result.error);

  const resultData = result.data;

  const responseHeaders = new Headers();

  try {
    const { customer_id, headers } = await authenticateCustomer(
      resultData,
      client,
      request
    );

    for (const [key, value] of headers.entries()) {
      if (key?.toLowerCase() === 'set-cookie') {
        responseHeaders.append(key, value);
      }
    }

    return data({ customer_id }, { headers: responseHeaders });
  } catch (error: any) {
    const formError =
      error.response.data === 'Unauthorized'
        ? 'Sorry! We could not find a user matching those credentials.'
        : 'Something went horribly wrong...';

    throw new FormValidationError({ fieldErrors: { formError } });
  }
};

const logout: V2ActionHandler<{}> = async (
  data: { redirect?: string },
  { request }
) => {
  const headers = new Headers();

  const client = await createMedusaClient({ request });

  await client.auth.deleteSession();

  await destroyCookie(headers, authCookie);

  await destroyCartSession(headers);

  throw redirect(data.redirect || '/', { headers });
};

const actions = {
  checkEmail,
  login,
  logout,
};

export const action = async (actionArgs: ActionFunctionArgs) => {
  return await handleActionV2({
    actionArgs,
    actions,
  });
};

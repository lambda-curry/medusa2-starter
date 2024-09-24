import { useCustomer } from '@ui-components/hooks/useCustomer';
import { useLogin } from '@ui-components/hooks/useLogin';
import { Alert } from '@components/alert';
import { ButtonLink, SubmitButton } from '@components/buttons';
import { Container } from '@components/container/Container';
import { Form } from '@components/forms/Form';
import { FormError } from '@components/forms/FormError';
import { json, LoaderFunctionArgs, redirect } from '@remix-run/node';
import {
  FetcherWithComponents,
  useFetcher,
  useLoaderData,
  useNavigate,
} from '@remix-run/react';
import { useEffect } from 'react';
import { ConfirmPasswordFieldGroup } from '@components/field-groups';
import { CustomerAction, resetPasswordFormValidator } from './api.customer';

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') || '';
  const token = url.searchParams.get('token') || '';

  if (!email || !token) {
    throw redirect('/products');
  }

  return json({ email, token });
}

export default function ResetPasswordRoute() {
  const { email, token } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ type: string }>() as FetcherWithComponents<{
    type: string;
  }>;
  const navigate = useNavigate();
  const { customer } = useCustomer();
  const { toggleLoginModal } = useLogin();
  const isLoggedIn = customer?.id;

  useEffect(() => {
    if (isLoggedIn) navigate('/', { replace: true });
  }, [customer]);

  if (isLoggedIn) return null;

  return (
    <section className="py-8">
      <Container>
        <h1 className="text-center text-xl font-bold text-gray-900">
          Reset your password
        </h1>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-lg bg-white px-4 py-8 shadow sm:px-10">
            {fetcher.data?.type === 'unknown_error' && (
              <Alert className="mb-4" type="error">
                The reset password token has expired.
              </Alert>
            )}

            {fetcher.data?.type === 'success' && (
              <>
                <h2 className="font-bold text-gray-900">
                  You've successfully reset your password!
                </h2>
                <p className="mt-4">
                  <ButtonLink size="sm" onClick={() => toggleLoginModal()}>
                    Login with your new password
                  </ButtonLink>
                </p>
              </>
            )}

            {fetcher.data?.type !== 'success' && (
              <Form
                method="post"
                action="/api/customer"
                subaction={CustomerAction.RESET_PASSWORD}
                validator={resetPasswordFormValidator}
                fetcher={fetcher}
              >
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="email" value={email} />

                <ConfirmPasswordFieldGroup className="mt-0" />

                <FormError />

                <SubmitButton className="w-full" />
              </Form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

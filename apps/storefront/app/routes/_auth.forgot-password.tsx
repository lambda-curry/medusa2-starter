import { Alert } from '@components/alert';
import { ButtonLink, SubmitButton } from '@components/buttons';
import { Container } from '@components/container/Container';
import { FieldGroup } from '@components/forms/fields/FieldGroup';
import { FieldText } from '@components/forms/fields/FieldText';
import { Form } from '@components/forms/Form';
import { FormError } from '@components/forms/FormError';
import { useCustomer } from '@ui-components/hooks/useCustomer';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { fetchCustomer } from '@marketplace/util/server/root.server';
import {
  FetcherWithComponents,
  useFetcher,
  useNavigate,
} from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';
import { useEffect } from 'react';
import { CustomerAction, forgotPasswordFormValidator } from './api.customer';
import { LoaderFunctionArgs } from '@remix-run/node';
import { unstable_data as data } from '@remix-run/node';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const headers = request.headers;

  const responseHeaders = new Headers();

  const medusa = await createMedusaClient({ request });

  const customer = await fetchCustomer({ medusa, headers, responseHeaders });

  if (customer) return redirect('/');

  return data({}, { headers: responseHeaders });
};

export default function ForgotPasswordRoute() {
  const fetcher = useFetcher<{
    type?: string;
    email?: string;
  }>() as FetcherWithComponents<{
    type?: string;
    email?: string;
  }>;
  const navigate = useNavigate();

  const { customer } = useCustomer();

  useEffect(() => {
    if (customer?.id) navigate('/', { replace: true });
  }, [customer]);

  if (customer?.id) return null;

  return (
    <section className="py-8">
      <Container>
        <h1 className="text-center text-xl font-bold text-gray-900">
          Forgot Password
        </h1>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-lg bg-white p-8 shadow sm:px-10">
            <Form
              method="post"
              action="/api/customer"
              subaction={CustomerAction.GENERATE_RESET_PASSWORD_TOKEN}
              validator={forgotPasswordFormValidator}
              fetcher={fetcher}
            >
              {fetcher.data?.type === 'not_found' && (
                <Alert className="mb-4" type="error">
                  We couldn't find a customer matching the email address you
                  entered.
                </Alert>
              )}

              {fetcher.data?.type === 'success' && (
                <>
                  <input
                    type="hidden"
                    name="email"
                    value={fetcher.data?.email}
                  />
                  <h2 className="font-bold text-gray-900">
                    Reset password link sent!
                  </h2>
                  <p className="mt-4 text-sm text-gray-700">
                    We have sent a link to reset your password to{' '}
                    <strong>{fetcher.data?.email}</strong>.
                  </p>
                  <p className="mt-4 text-sm text-gray-700">
                    Didn't receive it?{' '}
                    <ButtonLink size="sm" type="submit">
                      {fetcher.state === 'submitting'
                        ? 'Resending link...'
                        : 'Resend link'}
                    </ButtonLink>
                  </p>
                </>
              )}

              {fetcher.data?.type !== 'success' && (
                <>
                  <FieldGroup className="mt-0">
                    <FieldText
                      type="email"
                      name="email"
                      label="Email address"
                    />
                  </FieldGroup>

                  <FormError />

                  <SubmitButton className="w-full" />
                </>
              )}
            </Form>
          </div>
        </div>
      </Container>
    </section>
  );
}

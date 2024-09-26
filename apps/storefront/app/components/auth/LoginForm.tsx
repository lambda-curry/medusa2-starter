import { FC, useEffect } from 'react';
import {
  FetcherWithComponents,
  useFetcher,
  useNavigate,
} from '@remix-run/react';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { useCustomer } from '@ui-components/hooks/useCustomer';
import { useLogin } from '@ui-components/hooks/useLogin';
import { Form, FormProps } from '@components/forms/Form';
import { FormError } from '@components/forms/FormError';
import { ButtonLink, SubmitButton } from '@components/buttons';
import { FieldCheckbox } from '@components/forms/fields/FieldCheckbox';
import { FieldGroup } from '@components/forms/fields/FieldGroup';
import { FieldPassword } from '@components/forms/fields/FieldPassword';
import { FieldText } from '@components/forms/fields/FieldText';
import { useSendEvent } from '@libs/util/analytics/useAnalytics';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormProps
  extends Partial<FormProps<LoginFormValues, 'login'>> {
  redirect?: string;
  onSuccess?: () => void;
  defaultValues?: Partial<LoginFormValues>;
}

export const loginFormValidator = withYup(
  Yup.object().shape({
    email: Yup.string().required('Email is required'),
    password: Yup.string().required('Password is required'),
    rememberMe: Yup.string().optional(),
  })
);

export const LoginForm: FC<LoginFormProps> = ({
  redirect,
  onSuccess,
  ...props
}) => {
  const fetcher = useFetcher<{ name: string }>();
  const navigate = useNavigate();
  const { customer } = useCustomer();
  const { toggleLoginModal } = useLogin();
  const sendLoginEvent = useSendEvent('login');
  const isLoggedIn = customer?.id;
  const isSubmitting =
    fetcher.state === 'submitting' || fetcher.state === 'loading';

  const defaultValues = {
    email: '',
    password: '',
    rememberMe: false,
    ...props.defaultValues,
  };

  useEffect(() => {
    if (!isSubmitting && isLoggedIn && onSuccess) {
      sendLoginEvent({ method: 'password' });
      onSuccess();
    }
  }, [isSubmitting, isLoggedIn]);

  const handleForgotPasswordClick = () => {
    toggleLoginModal(false);
    navigate('/forgot-password');
  };

  return (
    <Form<LoginFormValues, 'login'>
      id="loginForm"
      method="post"
      action="/api/auth"
      subaction="login"
      fetcher={fetcher}
      validator={loginFormValidator}
      {...props}
      defaultValues={defaultValues}
    >
      <input type="hidden" name="redirect" value={redirect} />

      <FormError className="mt-0" />

      <FieldGroup className="mt-0">
        <FieldText
          type="email"
          name="email"
          label="Email address"
          fieldOptions={{
            validationBehavior: {
              initial: 'onSubmit',
              whenTouched: 'onSubmit',
              whenSubmitted: 'onChange',
            },
          }}
        />
        <FieldPassword
          name="password"
          label="Password"
          fieldOptions={{
            validationBehavior: {
              initial: 'onSubmit',
              whenTouched: 'onSubmit',
              whenSubmitted: 'onChange',
            },
          }}
        />
      </FieldGroup>

      <FieldGroup className="mt-0 items-center">
        <div className="col-span-12 flex items-center justify-between">
          <FieldCheckbox name="rememberMe" label="Remember me" />
          <ButtonLink size="sm" onClick={handleForgotPasswordClick}>
            Forgot your password?
          </ButtonLink>
        </div>
      </FieldGroup>

      <SubmitButton className="block w-full">
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </SubmitButton>
    </Form>
  );
};

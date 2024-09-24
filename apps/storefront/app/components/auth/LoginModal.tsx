import { useCart } from '@ui-components/hooks/useCart';
import { useLogin } from '@ui-components/hooks/useLogin';
import { Modal } from '@components/modals';
import { LoginForm } from './LoginForm';
import { useSiteDetails } from '@ui-components/hooks/useSiteDetails';
import { URLAwareNavLink } from '@components/link';

export const LoginModal = () => {
  const { cart } = useCart();
  const { login, toggleLoginModal } = useLogin();
  const { admin_url } = useSiteDetails();

  return (
    <Modal isOpen={!!login.open} onClose={() => toggleLoginModal(false)}>
      <h2 className="mb-4 text-lg font-bold text-gray-900">
        Log in to your account
      </h2>
      <LoginForm
        redirect={login.redirect}
        defaultValues={{ email: cart?.email ?? '' }}
        onSuccess={() => toggleLoginModal(false)}
      />
      <div className="flex justify-end gap-2 pt-6">
        <URLAwareNavLink
          key={admin_url}
          url={admin_url}
          newTab={true}
          className="text-primary-600 hover:text-primary-500 block text-sm underline"
          prefetch="intent"
        >
          Admin Login
        </URLAwareNavLink>
      </div>
    </Modal>
  );
};

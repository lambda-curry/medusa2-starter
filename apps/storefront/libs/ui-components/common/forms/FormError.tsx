import { FC, HTMLAttributes } from 'react';
import { useField } from 'remix-validated-form';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import clsx from 'clsx';
import { Alert } from '../alert';

export interface FormErrorProps extends HTMLAttributes<HTMLDivElement> {
  error?: string;
  onClearClick?: () => void;
}

export interface FormErrorActionProps extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  onClearClick?: FormErrorProps['onClearClick'];
}

export const FormErrorAction: FC<FormErrorActionProps> = ({ onClearClick, ...props }) => {
  const { clearError } = useField('formError');

  const handleClick = () => {
    if (onClearClick) return onClearClick();
    return clearError();
  };

  return (
    <button onClick={handleClick} {...props}>
      <span className="sr-only">Dismiss</span>
      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

export const FormError: FC<FormErrorProps> = ({ className, error, onClearClick }) => {
  const { error: formError } = useField('formError');

  if (!error && !formError) return null;

  return (
    <Alert
      type="error"
      className={clsx('form__error my-6', className)}
      action={(props) => <FormErrorAction onClearClick={onClearClick} {...props} />}
    >
      {error || formError}
    </Alert>
  );
};

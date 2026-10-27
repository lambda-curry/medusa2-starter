import clsx from 'clsx';
import { FC, HTMLAttributes } from 'react';
import { useRemixFormContext } from 'remix-hook-form';
import { Alert } from '../../alert';

export interface FormErrorProps extends HTMLAttributes<HTMLDivElement> {
  error?: string;
  onClearClick?: () => void;
}

export const FormError: FC<FormErrorProps> = ({ className, error, onClearClick }) => {
  const { formState } = useRemixFormContext();

  if (!formState.errors?.root?.message && !error) return null;

  return (
    <Alert type="error" className={clsx('form__error my-6', className)}>
      {error || formState.errors?.root?.message}
    </Alert>
  );
};

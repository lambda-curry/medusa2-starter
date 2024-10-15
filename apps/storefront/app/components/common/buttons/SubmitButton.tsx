import { FC } from 'react';
import { useIsSubmitting } from 'remix-validated-form';
import { Button, ButtonProps } from './Button';

export interface SubmitButtonProps extends ButtonProps {}

export const SubmitButton: FC<SubmitButtonProps> = ({ children, ...props }) => {
  const isSubmitting = useIsSubmitting(props.form);

  return (
    <Button variant="primary" type="submit" disabled={isSubmitting} {...props}>
      {children || (isSubmitting ? 'Submitting...' : 'Submit')}
    </Button>
  );
};

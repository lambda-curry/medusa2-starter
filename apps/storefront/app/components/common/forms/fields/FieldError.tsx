import { FC, HTMLAttributes, ReactElement } from 'react';
import clsx from 'clsx';

export type FieldErrorComponent = (
  errorProps: Omit<FieldErrorProps, 'errorComponent'>,
) => ReactElement<any, any> | null;

export interface FieldErrorProps extends HTMLAttributes<HTMLDivElement> {
  error?: string;
  errorComponent?: FieldErrorComponent;
}

export const FieldError: FC<FieldErrorProps> = ({ className, errorComponent, ...props }) => {
  if (errorComponent) return errorComponent(props);

  if (!props.error) return null;

  return (
    <div className={clsx('field__error mt-2 text-sm text-red-600', className)} {...props}>
      {props.error}
    </div>
  );
};

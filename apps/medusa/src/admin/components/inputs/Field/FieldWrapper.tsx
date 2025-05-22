/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { FieldError } from './Error';
import { Label } from './Label';
import type { FieldWrapperProps } from './types';

export const FieldWrapper = <T,>({
  label,
  labelClassName,
  labelTooltip,
  wrapperClassName,
  errorClassName,
  formErrors,
  name,
  children,
  ...props
}: FieldWrapperProps<T>) => (
  <div className={wrapperClassName}>
    {label && (
      <Label htmlFor={name} tooltip={labelTooltip} className={labelClassName}>
        {label}
      </Label>
    )}
    {children({ ...props, name } as T)}
    {formErrors && name ? <FieldError className={errorClassName} name={name} errors={formErrors} /> : null}
  </div>
);

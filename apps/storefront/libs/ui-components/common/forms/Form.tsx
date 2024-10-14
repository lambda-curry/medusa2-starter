import { ValidatedForm, FormProps as ValidatedFormProps, Validator } from 'remix-validated-form';
import { withYup } from '@remix-validated-form/with-yup';
import { AnyObjectSchema } from 'yup';
import clsx from 'clsx';
import { FormEvent } from 'react';
import debounce from 'lodash/debounce';

export interface FormProps<DataType extends object, Subaction extends string | undefined>
  extends Omit<ValidatedFormProps<DataType, Subaction>, 'validator'> {
  className?: string;
  validationSchema?: AnyObjectSchema;
  validator?: Validator<DataType>;
  sessionStorageKey?: string;
}

export function Form<DataType extends object, Subaction extends string | undefined = undefined>({
  className,
  validator,
  validationSchema,
  children,
  sessionStorageKey,
  ...props
}: FormProps<DataType, Subaction>) {
  const formValidator = validationSchema ? withYup(validationSchema) : validator;

  if (!formValidator) {
    console.error('Form must have either a validationSchema or validator');
    throw new Error('Form must have either a validationSchema or validator');
  }

  const handleChange = debounce(
    (event: FormEvent<HTMLFormElement>) => {
      if (!sessionStorageKey) return;
      const form = (event.target as HTMLInputElement).form; // Note: event type is wrong
      if (!form) return;
      const formValues = JSON.parse(sessionStorage.getItem(sessionStorageKey) || '{}');
      const formData = new FormData(form);
      formData.forEach((value, key) => (formValues[key] = value));
      sessionStorage.setItem(sessionStorageKey, JSON.stringify(formValues));
    },
    250,
    {
      trailing: true,
    },
  );

  return (
    <ValidatedForm className={clsx('form', className)} validator={formValidator} onChange={handleChange} {...props}>
      {children}
    </ValidatedForm>
  );
}

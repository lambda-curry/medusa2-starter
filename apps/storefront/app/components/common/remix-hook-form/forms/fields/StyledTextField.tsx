import { TextField } from '@lambdacurry/forms/remix-hook-form/text-field';
import clsx from 'clsx';
import type { ComponentProps } from 'react';

type StyledTextFieldProps = ComponentProps<typeof TextField> & {
  name: string;
};

export const StyledTextField = ({ className, name, ...props }: StyledTextFieldProps) => {
  return (
    <TextField
      {...props}
      className={clsx(
        '[&_input]:!h-12 [&_input]:border-gray-200 [&_input]:!bg-white [&_input]:text-[16px] [&_input]:shadow-sm [&_input]:!ring-0',
        '[&_input:-webkit-autofill]:!transition-[background-color_5000s_ease-in-out_0s]',
        '[&_input:-webkit-autofill]:!shadow-[0_0_0_1000px_white_inset]',
        '[&_label]:text-[16px] [&_label]:text-gray-600',
        className,
      )}
      name={name}
    />
  );
};

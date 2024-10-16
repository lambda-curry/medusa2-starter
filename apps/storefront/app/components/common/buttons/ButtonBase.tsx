import clsx from 'clsx';
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ForwardRefRenderFunction,
  ForwardedRef,
  HTMLAttributes,
  forwardRef,
} from 'react';

export type ButtonRef = HTMLButtonElement & HTMLAnchorElement;

export type ButtonAs =
  | keyof Pick<JSX.IntrinsicElements, 'a' | 'button' | 'span'>
  | ((props: ButtonHTMLAttributes<any> & AnchorHTMLAttributes<any> & HTMLAttributes<HTMLSpanElement>) => JSX.Element);

export type ButtonBaseProps = (ButtonHTMLAttributes<any> &
  AnchorHTMLAttributes<any> &
  HTMLAttributes<HTMLSpanElement>) & {
  as?: ButtonAs;
  ref?: ForwardedRef<ButtonRef>;
};

const ButtonBaseInner: ForwardRefRenderFunction<ButtonRef, ButtonBaseProps> = (
  { as: T = 'button', className, disabled, ...props },
  ref,
) => {
  const type = T === 'button' ? 'button' : undefined;

  return (
    <T
      ref={ref}
      type={type}
      disabled={disabled}
      className={clsx(
        'button focus:ring-primary-300 inline-flex items-center justify-center gap-1 focus:outline-none focus:ring-2',
        { 'cursor-not-allowed opacity-50': disabled },
        className,
      )}
      {...props}
    />
  );
};

export const ButtonBase = forwardRef(ButtonBaseInner);

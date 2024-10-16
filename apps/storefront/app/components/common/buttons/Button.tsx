import { type FC, forwardRef } from 'react';
import clsx from 'clsx';
import { ButtonBase, type ButtonBaseProps, ButtonRef } from './ButtonBase';

export interface ButtonProps extends ButtonBaseProps {
  variant?: 'default' | 'primary' | 'link' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const selectStructureClassNames = (variant: ButtonProps['variant']) => {
  switch (variant) {
    case 'link':
      return 'underline';
    case 'ghost':
      return '';
    default:
      return 'inline-flex items-center gap-2 rounded-full font-bold border';
  }
};

const selectSizeClassNames = (variant: ButtonProps['variant'], size: ButtonProps['size']) => {
  if (variant === 'link') {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  }

  switch (size) {
    case 'sm':
      return 'text-sm py-[9px] px-4';
    case 'lg':
      return 'text-lg py-[13px] px-6';
    default:
      return 'text-base py-[11px] px-5';
  }
};

const selectVariantClassNames = (variant: ButtonProps['variant']) => {
  switch (variant) {
    case 'primary':
      return 'button--primary text-white bg-primary hover:bg-primary-800 focus:border-primary-500';

    case 'link':
      return 'button--link text-primary-600 hover:text-primary-500';
    case 'ghost':
      return '';
    default:
      return 'button--default border-primary-100 text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100';
  }
};

export const Button = forwardRef<ButtonRef, ButtonProps>(({ className, variant = 'default', size, ...props }, ref) => (
  <ButtonBase
    ref={ref}
    className={clsx(
      selectStructureClassNames(variant),
      selectSizeClassNames(variant, size),
      selectVariantClassNames(variant),
      className,
    )}
    {...props}
  />
));

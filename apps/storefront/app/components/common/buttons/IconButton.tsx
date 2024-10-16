import { FC, JSXElementConstructor, SVGAttributes } from 'react';
import clsx from 'clsx';
import { ButtonBase, ButtonBaseProps } from './ButtonBase';

export interface IconButtonProps extends ButtonBaseProps {
  icon: JSXElementConstructor<any>;
  iconProps?: SVGAttributes<SVGElement>;
}

export const IconButton: FC<IconButtonProps> = ({ icon: Icon, className, iconProps, ...props }) => (
  <ButtonBase
    className={clsx(
      'icon-button inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-none text-gray-500 placeholder:bg-transparent hover:bg-gray-100 hover:text-gray-700 focus:text-gray-700',
      className,
    )}
    {...props}
  >
    <Icon {...iconProps} className={clsx(iconProps?.className, 'h-6 w-6 text-current')} />
  </ButtonBase>
);

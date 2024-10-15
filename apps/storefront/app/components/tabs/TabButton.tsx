import { forwardRef } from 'react';
import clsx from 'clsx';
import { Button, ButtonProps, ButtonRef } from '@app/components/common/buttons';

export interface TabButtonProps extends ButtonProps {
  selected?: boolean;
}

export const TabButton = forwardRef<ButtonRef, TabButtonProps>(({ selected, className, ...props }, ref) => (
  <Button
    ref={ref}
    size="sm"
    className={clsx(
      'whitespace-nowrap !rounded-full',
      {
        '!bg-white !text-gray-700 shadow-sm': selected,
        '!text-primary-600 hover:!text-primary-800 hover:!bg-primary-100 !border-transparent !bg-transparent':
          !selected,
      },
      className,
    )}
    {...props}
  />
));

import type { FC } from 'react';
import { IconButton } from './IconButton';
import clsx from 'clsx';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';

interface ScrollArrowButtonsProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showStartArrow: boolean;
  showEndArrow: boolean;
  handleArrowClick: (direction: 'start' | 'end') => void;
}

export const ScrollArrowButtons: FC<ScrollArrowButtonsProps> = ({
  className,
  orientation = 'horizontal',
  showStartArrow,
  showEndArrow,
  handleArrowClick,
}) => {
  return (
    <div
      className={clsx(
        'scroll-arrow-buttons pointer-events-none absolute flex justify-between',
        {
          '-left-5 top-1/2 w-[calc(100%+2.3rem)]': orientation === 'horizontal',
          '-top-5 left-1/2 h-[calc(100%+2.3rem)] flex-col': orientation === 'vertical',
        },
        className,
      )}
    >
      <IconButton
        aria-label="Scroll section toward the start"
        onClick={() => handleArrowClick('start')}
        className={clsx(
          'text-primary bg-primary-200 hover:bg-primary-400 hover:text-primary-800 focus:text-primary-800 z-10 opacity-0 transition-opacity',
          {
            'pointer-events-auto opacity-100': showStartArrow,
            'rotate-90 transform': orientation === 'vertical',
          },
        )}
        icon={ArrowLeftIcon}
      />
      <IconButton
        aria-label="Scroll section toward the end"
        onClick={() => handleArrowClick('end')}
        className={clsx(
          'text-primary bg-primary-200 hover:bg-primary-400 hover:text-primary-800 focus:text-primary-800 z-10 opacity-0 transition-opacity',
          {
            'pointer-events-auto opacity-100': showEndArrow,
            'rotate-90 transform': orientation === 'vertical',
          },
        )}
        icon={ArrowRightIcon}
      />
    </div>
  );
};

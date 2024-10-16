import type { FC, HTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';

export const Container: FC<PropsWithChildren & HTMLAttributes<HTMLDivElement> & { className?: string }> = ({
  className,
  ...props
}) => {
  return (
    <div className={clsx('mx-auto w-full max-w-screen-2xl px-4 sm:px-6 md:px-8 xl:px-[86px]', className)} {...props} />
  );
};

import type { FC, PropsWithChildren } from 'react';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import { useSiteDetails } from '@app/hooks/useSiteDetails';
import { Image } from '@app/components/common/images/Image';

const LogoHeader: FC<PropsWithChildren & { primary: boolean | undefined; className: string }> = ({
  primary,
  className,
  ...rest
}) => (primary ? <h1 className={clsx('logo-header', className)} {...rest} /> : <h2 className={className} {...rest} />);

export const LogoStoreName: FC<{ primary?: boolean; className?: string }> = ({ primary, className }) => {
  const { store, settings } = useSiteDetails();

  if (!store || !settings) return null;

  // Override the store name for the 360 Training platform
  const displayName = '360 TRAINING';

  return (
    <Link
      viewTransition
      to="/"
      prefetch="viewport"
      className={clsx('logo-header flex flex-nowrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-4', className)}
    >
      <LogoHeader primary={primary} className="xs:text-2xl whitespace-nowrap text-lg font-bold font-inter">
        {displayName}
      </LogoHeader>
    </Link>
  );
};

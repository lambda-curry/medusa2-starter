import { Card } from '@components/card/Card';
import { CardBody } from '@components/card/CardBody';
import { CardContent } from '@components/card/CardContent';
import { CardHeader } from '@components/card/CardHeader';
import { CardThumbnail } from '@components/card/CardThumbnail';
import { CardTitle } from '@components/card/CardTitle';
import { Vendor } from '@marketplace/util/medusa/types';
import { Link } from '@remix-run/react';
import clsx from 'clsx';
import { FC } from 'react';

export interface VendorCardProps {
  className?: string;
  vendor: Vendor;
}

export const VendorCard: FC<VendorCardProps> = ({ className, vendor }) => {
  return (
    <Link className="flex-1" to={`/vendors/${vendor.handle}`}>
      <Card className={clsx('post-card h-full', className)}>
        <CardThumbnail
          className="aspect-2 !m-0 w-full object-cover object-center"
          src={vendor.logo?.url}
          alt={vendor.name}
        />

        <CardContent className="py-4">
          <CardHeader className="mb-2">
            <CardTitle className="!m-0 pr-2">{vendor.name}</CardTitle>
          </CardHeader>

          <CardBody>{vendor.description}</CardBody>
        </CardContent>
      </Card>
    </Link>
  );
};

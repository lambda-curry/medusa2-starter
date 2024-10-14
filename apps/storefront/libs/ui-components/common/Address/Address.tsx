import { formatPhoneNumber } from '@libs/util';
import { StoreCartAddress } from '@medusajs/types';
import { FC } from 'react';

export interface AddressProps {
  address: StoreCartAddress;
}

export const Address: FC<AddressProps> = ({ address }) => {
  return (
    <address className="not-italic">
      {address.address_1}
      <br />
      {address.address_2 && (
        <>
          {address.address_2}
          <br />
        </>
      )}
      {address.city}, {address.province} {address.postal_code} <span className="uppercase">{address.country_code}</span>
      {address.phone && (
        <>
          <br />
          {formatPhoneNumber(address.phone)}
        </>
      )}
    </address>
  );
};

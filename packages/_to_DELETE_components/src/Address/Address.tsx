import { FC } from 'react';
import { medusaAddressToAddress } from '../../../utils/addresses';
import { type MedusaAddress } from '../../../utils/types';
import { formatPhoneNumber } from '../../../utils/phoneNumber';

export interface AddressProps {
  address: MedusaAddress;
}

export const Address: FC<AddressProps> = ({ address }) => {
  const { address1, address2, city, province, postalCode, countryCode, phone } = medusaAddressToAddress(address);

  return (
    <address className="not-italic">
      {address1}
      <br />
      {address2 && (
        <>
          {address2}
          <br />
        </>
      )}
      {city}, {province} {postalCode} <span className="uppercase">{countryCode}</span>
      {phone && (
        <>
          <br />
          {formatPhoneNumber(phone)}
        </>
      )}
    </address>
  );
};

import type { Address } from '@libs/types';

export const AddressDisplay: React.FC<{
  title?: string;
  address: Address;
  countryOptions: { value: string; label: string }[];
}> = ({ title, address, countryOptions }) => (
  <span>
    {title && <dt className="mt-6 text-sm font-bold text-gray-700">{title}</dt>}
    <dd className="mt-0.5">
      {address?.company && (
        <>
          {address?.company}
          <br />
        </>
      )}
      {address?.address1}
      <br />
      {address?.address2 && (
        <>
          {address?.address2}
          <br />
        </>
      )}
      {address?.city}, {address?.province} {address?.postalCode}
      <br />
      {address?.countryCode && (
        <>
          {countryOptions.find(({ value }) => value === address?.countryCode)?.label}
          <br />
        </>
      )}
    </dd>
  </span>
);

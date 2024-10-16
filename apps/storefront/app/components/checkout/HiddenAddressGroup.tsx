import { Address } from '@libs/types';

interface HiddenAddressGroupProps {
  address: Address;
  prefix: 'shippingAddress' | 'billingAddress';
}

const HiddenAddressGroup: React.FC<HiddenAddressGroupProps> = ({ address, prefix }) => {
  return (
    <>
      {Object.keys(address).map((key: string) => {
        const castedKey = key as keyof Address;
        if (address[castedKey] == null) return;

        return (
          <input
            type="hidden"
            key={castedKey as string}
            name={`${prefix}.${key}`}
            value={(address[castedKey] as string) ?? ''}
          />
        );
      })}
    </>
  );
};

export default HiddenAddressGroup;

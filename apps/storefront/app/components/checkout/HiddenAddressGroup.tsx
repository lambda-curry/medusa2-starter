import { type Address } from '@utils/types';

interface HiddenAddressGroupProps {
  address: Address;
  prefix: 'shippingAddress' | 'billingAddress';
}

const HiddenAddressGroup: React.FC<HiddenAddressGroupProps> = ({
  address,
  prefix,
}) => {
  return (
    <>
      {Object.keys(address).map((key: string) => {
        const castedKey = key as keyof Address;
        if (address[castedKey] == null) return;

        return (
          <input
            type="hidden"
            key={castedKey}
            name={`${prefix}.${key}`}
            value={(address[castedKey] as string) ?? ''}
          />
        );
      })}
    </>
  );
};

export default HiddenAddressGroup;

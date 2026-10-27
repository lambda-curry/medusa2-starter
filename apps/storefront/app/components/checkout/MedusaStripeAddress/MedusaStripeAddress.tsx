import { useCheckout } from '@app/hooks/useCheckout';
import { useEnv } from '@app/hooks/useEnv';
import { useRegion } from '@app/hooks/useRegion';
import { Address } from '@libs/types';
import { BaseCartAddress } from '@medusajs/types/dist/http/cart/common';
import { AddressElement, Elements } from '@stripe/react-stripe-js';
import { type AddressMode, loadStripe, StripeAddressElementChangeEvent } from '@stripe/stripe-js';
import { type Dispatch, type FC, type SetStateAction, useMemo } from 'react';

export interface StripeAddress {
  address: Address;
  completed: boolean;
}

export const defaultStripeAddress = (address?: BaseCartAddress | null | undefined): StripeAddress => ({
  address: {
    firstName: address?.first_name || '',
    lastName: address?.last_name || '',
    address1: address?.address_1 || '',
    address2: address?.address_2 || '',
    province: address?.province || '',
    city: address?.city || '',
    countryCode: address?.country_code || 'us',
    postalCode: address?.postal_code || '',
    phone: address?.phone || '',
  },
  completed: false,
});

interface MedusaStripeAddressProps {
  title?: string;
  address: Address;
  mode: AddressMode;
  allowedCountries?: string[];
  setAddress: (address: StripeAddress) => void;
}

export const MedusaStripeAddress: FC<MedusaStripeAddressProps> = ({
  title,
  address,
  mode,
  allowedCountries = [],
  setAddress,
}) => {
  const { env } = useEnv();
  const { cart } = useCheckout();
  const { region } = useRegion();

  const handleChange = (
    event:
      | StripeAddressElementChangeEvent
      | Pick<StripeAddressElementChangeEvent, 'complete' | 'isNewAddress' | 'value'>,
  ) => {
    const fullNameArray = event.value.name?.split(' ') || [];
    const firstName = fullNameArray.slice(0, -1).join(' ');
    const lastName = fullNameArray.slice(-1).join(' ');

    // Stripe does not return province for some countries
    const useProvincePlaceHolder = event.complete && !event.value.address.state;

    setAddress({
      address: {
        firstName: event.value.firstName || firstName || '',
        lastName: event.value.lastName || lastName || '',
        address1: event.value.address.line1,
        address2: event.value.address.line2 ?? '',
        province: useProvincePlaceHolder ? '-' : event.value.address.state,
        city: event.value.address.city,
        countryCode: event.value.address.country?.toLowerCase() as string,
        postalCode: event.value.address.postal_code,
        phone: event.value.phone ?? '',
      },
      completed: event.complete,
    });
  };

  const stripePromise = useMemo(() => {
    return env.STRIPE_PUBLIC_KEY ? loadStripe(env.STRIPE_PUBLIC_KEY) : null;
  }, [env.STRIPE_PUBLIC_KEY]);

  if (!cart) return null;

  return (
    <div>
      {title && <h3 className="mt-6 text-sm">{title}</h3>}
      <Elements
        stripe={stripePromise}
        options={{
          mode: 'setup',
          currency: region.currency_code,
          appearance: {
            variables: {
              borderRadius: '6px',
              spacingUnit: '4.601px',
              fontSizeBase: '16px',
              colorText: '#374151',
              fontWeightNormal: '400',
              fontWeightBold: '700',
              fontSizeSm: '16px',
            },
            rules: {
              '.Input': {
                fontSize: '1rem',
                color: '#000000',
              },
              '.Input:focus': {
                boxShadow: 'inset 0 0 0 1px rgba(210, 213, 218, 1)',
              },
              '.Label': {
                FontWeight: '700',
              },
            },
          },
        }}
      >
        <AddressElement
          options={{
            mode,
            allowedCountries,
            display: { name: 'split' },
            fields: { phone: 'always' },
            validation: { phone: { required: 'always' } },
            defaultValues: {
              address: {
                line1: address.address1,
                line2: address.address2,
                city: address.city,
                state: address.province,
                postal_code: address.postalCode,
                country: address.countryCode?.toUpperCase() || 'us',
              },
              phone: address.phone,
              firstName: address.firstName,
              lastName: address.lastName,
            },
          }}
          onChange={handleChange}
        />
      </Elements>
    </div>
  );
};

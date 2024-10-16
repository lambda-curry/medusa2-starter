import { AddressElement, Elements } from '@stripe/react-stripe-js';
import { type AddressMode, loadStripe } from '@stripe/stripe-js';
import { useMemo, type Dispatch, type FC, type SetStateAction } from 'react';
import { useEnv } from '@app/hooks/useEnv';
import { useRegion } from '@app/hooks/useRegion';
import { useSiteDetails } from '@app/hooks/useSiteDetails';
import { BaseCartAddress } from '@medusajs/types/dist/http/cart/common';
import { useCheckout } from '@app/hooks/useCheckout';
import { Address } from '@libs/types';

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
  setAddress: Dispatch<SetStateAction<StripeAddress>>;
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
  const { settings } = useSiteDetails();

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
          onChange={(e) => {
            // Stripe does not return province for some countries
            const useProvincePlaceHolder = e.complete && !e.value.address.state;
            setAddress({
              address: {
                firstName: e.value.firstName ?? '',
                lastName: e.value.lastName ?? '',
                address1: e.value.address.line1,
                address2: e.value.address.line2 ?? '',
                province: useProvincePlaceHolder ? '-' : e.value.address.state,
                city: e.value.address.city,
                countryCode: e.value.address.country?.toLowerCase() as string,
                postalCode: e.value.address.postal_code,
                phone: e.value.phone ?? '',
              },
              completed: e.complete,
            });
          }}
        />
      </Elements>
    </div>
  );
};

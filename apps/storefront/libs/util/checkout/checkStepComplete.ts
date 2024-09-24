import { PricedShippingOption } from '@markethaus/storefront-client';
import { Cart, Customer } from '../medusa/types';
import { getShippingOptionsByProfile } from './getShippingOptionsByProfile';

export const checkContactInfoComplete = (cart: Cart, customer?: Pick<Customer, 'email'>) =>
  !!cart.email || !!customer?.email;

export const checkAccountDetailsComplete = (cart: Cart) => !!cart.shipping_address?.address_1;

export const checkDeliveryMethodComplete = (cart: Cart, shippingOptions: PricedShippingOption[]) => {
  const values = cart.shipping_methods?.map(sm => sm.shipping_option_id) || [];
  const shippingOptionsByProfile = getShippingOptionsByProfile(shippingOptions);

  return Object.values(shippingOptionsByProfile).every(shippingOptions =>
    shippingOptions.find(so => values.includes(so.id))
  );
};

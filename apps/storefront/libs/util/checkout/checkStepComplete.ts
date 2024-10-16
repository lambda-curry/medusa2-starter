import { StoreCart, StoreCartShippingOption, StoreCustomer } from '@medusajs/types';
import { getShippingOptionsByProfile } from './getShippingOptionsByProfile';

export const checkContactInfoComplete = (cart: StoreCart, customer?: Pick<StoreCustomer, 'email'>) =>
  !!cart.email || !!customer?.email;

export const checkAccountDetailsComplete = (cart: StoreCart) => !!cart.shipping_address?.address_1;

export const checkDeliveryMethodComplete = (cart: StoreCart, shippingOptions: StoreCartShippingOption[]) => {
  const values = cart.shipping_methods?.map((sm) => sm.shipping_option_id) || [];
  const shippingOptionsByProfile = getShippingOptionsByProfile(shippingOptions);

  return Object.values(shippingOptionsByProfile).every((shippingOptions) =>
    shippingOptions.find((so) => values.includes(so.id)),
  );
};

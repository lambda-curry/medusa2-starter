import { ShippingMethod } from '@markethaus/storefront-client';

export const calculateShipping = (shippingMethods: ShippingMethod[]) =>
  shippingMethods.reduce((acc, { price }) => acc + price || 0, 0);

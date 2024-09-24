import { getShippingOptionsByProfile } from '@marketplace/util/checkout';

import {
  addressValidation,
  confirmPasswordValidation,
  emailAddressValidation,
  nameValidation,
  phoneValidation
} from '@marketplace/util/validation';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { Cart, Customer } from '@marketplace/util/medusa/types';
import { ShippingOption } from '@markethaus/storefront-client';

const checkoutValidation = {
  cartId: Yup.string().required('Cart ID is missing')
};

const addressValidationSchema = Yup.object().shape({
  ...nameValidation,
  ...addressValidation,
  ...phoneValidation
});

export const checkoutUpdateContactInfoValidator = withYup(
  Yup.object().shape({
    ...checkoutValidation,
    ...emailAddressValidation
  })
);

export const checkoutUpdateBillingAddressValidator = withYup(
  Yup.object().shape({
    ...checkoutValidation,
    billingAddress: addressValidationSchema
  })
);

const accountDetailsSchema = Yup.object().shape({
  ...checkoutValidation,
  ...emailAddressValidation,
  allowSuggestions: Yup.boolean().optional(),
  shippingAddressId: Yup.string().required('Shipping address ID is required'),
  shippingAddress: Yup.object().when('shippingAddressId', {
    is: 'new',
    then: addressValidationSchema
  }),
  ...confirmPasswordValidation
});

export const checkoutAccountDetailsValidator = withYup(accountDetailsSchema);

// NOTE: ignored fields will be validated agains `checkoutAccountDetailsValidator` in final step of express checkout
export const expressCheckoutAccountDetailsValidator = withYup(
  accountDetailsSchema.shape({
    email: emailAddressValidation.email.optional(),
    shippingAddress: Yup.object().when('shippingAddressId', {
      is: 'new',
      then: addressValidationSchema.pick(['city', 'province', 'countryCode', 'postalCode'])
    })
  })
);

export const getCheckoutAddShippingMethodValidator = (shippingOptions: ShippingOption[]) => {
  const shippingOptionsByProfile = getShippingOptionsByProfile(shippingOptions);
  const shippingOptionsProfileIds = Object.keys(shippingOptionsByProfile);

  return withYup(
    Yup.object().shape({
      ...checkoutValidation,
      shippingOptionIds: Yup.array(Yup.string().required('Please select a delivery method'))
        .length(shippingOptionsProfileIds.length, 'Please select a delivery method for all items')
        .required('Please select a delivery method for all items')
    })
  );
};

export const checkoutPaymentValidator = withYup(
  Yup.object().shape({
    ...checkoutValidation,
    providerId: Yup.string().required('Provider ID is required'),
    paymentMethodId: Yup.string().required('Payment method ID is required'),
    sameAsShipping: Yup.string().optional(),
    billingAddress: Yup.object().when(['paymentMethodId', 'sameAsShipping'], {
      is: (paymentMethodId: string, sameAsShipping: string | boolean) => {
        return paymentMethodId === 'new' && !sameAsShipping;
      },
      then: addressValidationSchema,
      otherwise: Yup.object().strip()
    })
  })
);

export const checkoutAddDiscountCodeValidator = withYup(
  Yup.object().shape({
    ...checkoutValidation,
    code: Yup.string().optional()
  })
);

export const selectInitialShippingAddressId = (cart: Cart, customer?: Pick<Customer, 'shipping_addresses'>) => {
  if (!customer || !customer?.shipping_addresses?.length) return 'new';

  const firstAddress = customer?.shipping_addresses[0];
  const selectedAddress = customer?.shipping_addresses.find(a => a.id === cart.shipping_address_id);

  return selectedAddress?.id || firstAddress.id;
};

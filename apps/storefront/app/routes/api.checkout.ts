import type {
  AddressPayload,
  Cart,
  PricedShippingOption,
  StoreCartsRes,
} from '@markethaus/storefront-client';
import { addressPayload, addressToMedusaAddress } from '@utils/addresses';
import type { Address } from '@utils/types';
import { FormValidationError } from '@utils/validation/validation-error';
import type { ValidationErrorData } from '@utils/validation/validation-response';
import {
  handleActionV2,
  type V2ActionHandler,
} from '@marketplace/util/handleAction.server';
import { createMedusaClient } from '@marketplace/util/medusa/client.server';
import { destroyCartSession } from '@marketplace/util/server/cart-session.server';
import { _updateAccountDetails } from '@marketplace/util/server/checkout.server';
import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect, unstable_data } from '@remix-run/node';
import {
  checkoutAddDiscountCodeValidator,
  checkoutPaymentValidator,
  checkoutUpdateBillingAddressValidator,
  checkoutUpdateContactInfoValidator,
  getCheckoutAddShippingMethodValidator,
} from '~/components/checkout';

export enum CheckoutAction {
  UPDATE_CONTACT_INFO = 'updateContactInfo',
  UPDATE_ACCOUNT_DETAILS = 'updateAccountDetails',
  ADD_SHIPPING_METHODS = 'addShippingMethods',
  ADD_DISCOUNT_CODE = 'addDiscountCode',
  COMPLETE_CHECKOUT = 'completeCheckout',
  UPDATE_BILLING_ADDRESS = 'updateBillingAddress',
  UPDATE_EXPRESS_CHECKOUT_ADDRESS = 'updateExpressCheckoutAddress',
}

export interface UpdateContactInfoInput {
  cartId: string;
  email: string;
}

export interface UpdateAccountDetailsInput {
  cartId: string;
  customerId?: string;
  email: string;
  shippingAddress: Address;
  shippingAddressId: string;
  password?: string | null;
  confirmPassword?: string | null;
  allowSuggestions?: boolean;
  isExpressCheckout?: boolean;
}

export interface AddShippingMethodInput {
  cartId: string;
  shippingOptionIds: string[];
}

export interface AddDiscountCodeInput {
  cartId: string;
  code?: string;
}

export interface UpdateBillingAddressInput {
  cartId: string;
  billingAddress: Address;
}

export interface UpdatePaymentInput {
  cartId: string;
  providerId: string;
  paymentMethodId: string;
  sameAsShipping?: boolean;
  billingAddress: Address;
  noRedirect?: boolean;
}

export interface UpdateExpressCheckoutAddressInput {
  cartId: string;
  email: string;
  shippingAddress: Address;
}

export interface UpdateExpressCheckoutAddressResponse {
  cart: Cart;
  shippingOptions: PricedShippingOption[];
}

export interface ExpressCheckoutInput {
  accountDetails: UpdateAccountDetailsInput;
}

// const updateCustomerAccountDetails = async (
//   data: UpdateAccountDetailsInput,
//   { request }: ActionFunctionArgs
// ): Promise<StoreCartsRes> => {
//   const client = await createMedusaClient({ request });

//   const addressResult = await validateAndSuggestShippingAddress(data);
//   if (addressResult.response) throw addressResult.response;
//   data = addressResult.data!;

//   const isNewAddress = data.shippingAddressId === 'new';

//   const shippingAddress: AddressPayload | string = isNewAddress
//     ? (addressToMedusaAddress(data.shippingAddress) as AddressPayload)
//     : data.shippingAddressId;

//   if (isNewAddress) {
//     const { customer } = await client.customers.addAddress({
//       address: shippingAddress as AddressCreatePayload
//     });

//     const addressToAdd = customer.shipping_addresses.find(address =>
//       isEqual(medusaAddressToAddress(address), medusaAddressToAddress(shippingAddress as MedusaAddress))
//     );

//     const { cart } = await client.carts.update(data.cartId, {
//       shipping_address: addressToAdd?.id || '',
//       billing_address: addressToAdd?.id || ''
//     });

//     return { cart };
//   }

//   const { cart } = await client.carts.update(data.cartId, {
//     shipping_address: shippingAddress,
//     billing_address: shippingAddress
//   });

//   return { cart };
// };

const updateBillingAddress: V2ActionHandler<StoreCartsRes> = async (
  data: UpdateBillingAddressInput,
  { request }
) => {
  const client = await createMedusaClient({ request });

  const result = await checkoutUpdateBillingAddressValidator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  const billingAddress = addressToMedusaAddress(data.billingAddress);

  const { cart } = await client.carts.update(data.cartId, {
    billing_address: billingAddress as AddressPayload,
  });

  return { cart };
};

const updateExpressCheckoutAddress: V2ActionHandler<
  UpdateExpressCheckoutAddressResponse
> = async (data: UpdateExpressCheckoutAddressInput, actionFnArgs) => {
  const { request } = actionFnArgs;
  const client = await createMedusaClient({ request });

  const { cart: updatedCart, headers } = await _updateAccountDetails(
    {
      ...data,
      shippingAddressId: 'new',
      allowSuggestions: false,
      isExpressCheckout: true,
    } as UpdateAccountDetailsInput,
    actionFnArgs
  );

  const { shipping_options: shippingOptions } =
    await client.shippingOptions.listCartOptions(data.cartId);

  return {
    cart: updatedCart as Cart,
    shippingOptions,
  };
};

const updateContactInfo: V2ActionHandler<
  StoreCartsRes | ValidationErrorData
> = async (
  data: UpdateContactInfoInput,
  actionArgs
): Promise<StoreCartsRes | ValidationErrorData> => {
  const { request } = actionArgs;

  const client = await createMedusaClient({ request });

  const result = await checkoutUpdateContactInfoValidator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  const { cart } = await client.carts.update(data.cartId, {
    email: data.email,
  });

  return { cart };
};

const updateAccountDetails: V2ActionHandler<StoreCartsRes> = async (
  data: UpdateAccountDetailsInput,
  actionArgs
) => {
  const { cart, headers } = await _updateAccountDetails(data, actionArgs);

  return unstable_data({ cart }, { headers });
};

const addShippingMethods: V2ActionHandler<StoreCartsRes> = async (
  data: AddShippingMethodInput,
  actionArgs
) => {
  const client = await createMedusaClient(actionArgs);

  const { shipping_options: shippingOptions } =
    await client.shippingOptions.listCartOptions(data.cartId);

  const validator = getCheckoutAddShippingMethodValidator(shippingOptions);

  const result = await validator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  const { shippingOptionIds = [] } = result.data;

  await Promise.all(
    shippingOptionIds.map(
      async id =>
        await client.carts.addShippingMethod(data.cartId, { option_id: id })
    )
  );

  const { cart } = await client.carts.retrieve(data.cartId);

  return { cart };
};

const addDiscountCode: V2ActionHandler<StoreCartsRes> = async (
  data: { cartId: string; code: string },
  { request }
) => {
  const client = await createMedusaClient({ request });

  const result = await checkoutAddDiscountCodeValidator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  try {
    const { cart } = await client.carts.update(data.cartId, {
      discounts: [{ code: data.code }],
    });

    if (!cart)
      throw new FormValidationError({
        fieldErrors: {
          formError: 'Cart could not be updated. Please try again.',
        },
      });

    return { cart };
  } catch (error: any) {
    throw new FormValidationError({
      fieldErrors: { code: 'Code is invalid.' },
    });
  }
};

const completeCheckout: V2ActionHandler<unknown> = async (
  { noRedirect = false, ...data }: UpdatePaymentInput,
  actionArgs
) => {
  const { request } = actionArgs;

  const client = await createMedusaClient({ request });

  const result = await checkoutPaymentValidator.validate(data);

  if (!data.sameAsShipping && data.billingAddress)
    await updateBillingAddress(data, actionArgs);

  const { cart } = await client.carts.retrieve(data.cartId);

  if (data.sameAsShipping) {
    const { id, metadata, customer_id, ...billingAddress } =
      cart.shipping_address;
    await client.carts.update(data.cartId, {
      billing_address: addressPayload(billingAddress),
    });
  }

  if (cart.payment_session?.provider_id != data.providerId)
    await client.carts.setPaymentSession(data.cartId, {
      provider_id: data.providerId,
    });

  if (result.error) throw new FormValidationError(result.error);

  const isNewPaymentMethod = data.paymentMethodId === 'new';

  try {
    if (!isNewPaymentMethod && data.providerId === 'stripe') {
      await client.carts.updatePaymentSession(data.cartId, 'stripe', {
        data: { payment_method: data.paymentMethodId },
      });
    }

    const { data: cartData, type } = await client.carts.complete(data.cartId);

    if (type === 'cart' || !cartData)
      throw new FormValidationError({
        fieldErrors: {
          formError: 'Cart could not be completed. Please try again.',
        },
      });

    const headers = new Headers();

    await destroyCartSession(headers);

    if (noRedirect) return { order: cartData };

    return redirect(`/checkout/success?cart_id=${data.cartId}`, { headers });
  } catch (error: any) {
    if (error instanceof Response) throw error;
    if (error instanceof FormValidationError) throw error;

    console.error('cart error', error);

    throw new FormValidationError({
      fieldErrors: {
        formError: 'Something went wrong when completing your order.',
      },
    });
  }
};

export interface UpdatePaymentSessionInput {
  cartId: string;
  providerId: string;
  paymentMethodId: string;
}

const actions = {
  updateContactInfo,
  updateAccountDetails,
  updateBillingAddress,
  addShippingMethods,
  addDiscountCode,
  completeCheckout,
  updateExpressCheckoutAddress,
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleActionV2({ actionArgs, actions });
}

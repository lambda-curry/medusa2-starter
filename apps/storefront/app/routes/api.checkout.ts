import { addressPayload, addressToMedusaAddress } from '@libs/util/addresses';
import { FormValidationError } from '@libs/util/validation/validation-error';
import type { ValidationErrorData } from '@libs/util/validation/validation-response';
import { handleAction, type ActionHandler } from '@libs/util/handleAction.server';
import { _updateAccountDetails } from '@libs/util/server/checkout.server';
import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect, data as remixData } from '@remix-run/node';
import {
  checkoutAddDiscountCodeValidator,
  checkoutPaymentValidator,
  checkoutUpdateBillingAddressValidator,
  checkoutUpdateContactInfoValidator,
  getCheckoutAddShippingMethodValidator,
} from '@app/components/checkout';
import { StoreCart, StoreCartAddress, StoreCartResponse, StoreCartShippingOption } from '@medusajs/types';
import { Address, MedusaAddress } from '@libs/types';
import {
  initiatePaymentSession,
  placeOrder,
  retrieveCart,
  setShippingMethod,
  updateCart,
} from '@libs/util/server/data/cart.server';
import { listCartShippingOptions } from '@libs/util/server/data/fulfillment.server';
import { sdk } from '@libs/util/server/client.server';
import { removeCartId } from '@libs/util/server/cookies.server';

export enum CheckoutAction {
  UPDATE_CONTACT_INFO = 'updateContactInfo',
  UPDATE_ACCOUNT_DETAILS = 'updateAccountDetails',
  ADD_SHIPPING_METHODS = 'addShippingMethods',
  ADD_DISCOUNT_CODE = 'addDiscountCode',
  COMPLETE_CHECKOUT = 'completeCheckout',
  UPDATE_BILLING_ADDRESS = 'updateBillingAddress',
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
  cart: StoreCart;
  shippingOptions: StoreCartShippingOption[];
}

const updateBillingAddress: ActionHandler<StoreCartResponse> = async (data: UpdateBillingAddressInput, { request }) => {
  const result = await checkoutUpdateBillingAddressValidator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  const billingAddress = addressToMedusaAddress(data.billingAddress as Address) as StoreCartAddress;

  const { cart } = await updateCart(request, {
    billing_address: billingAddress,
  });

  return { cart };
};

const updateContactInfo: ActionHandler<StoreCartResponse | ValidationErrorData> = async (
  data: UpdateContactInfoInput,
  { request },
): Promise<StoreCartResponse | ValidationErrorData> => {
  const result = await checkoutUpdateContactInfoValidator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  const { cart } = await updateCart(request, {
    email: data.email,
  });

  return { cart };
};

const updateAccountDetails: ActionHandler<StoreCartResponse> = async (data: UpdateAccountDetailsInput, actionArgs) => {
  const { cart, headers } = await _updateAccountDetails(data, actionArgs);

  return remixData({ cart }, { headers });
};

const addShippingMethods: ActionHandler<StoreCartResponse> = async (data: AddShippingMethodInput, { request }) => {
  const shippingOptions = await listCartShippingOptions(data.cartId);

  const validator = getCheckoutAddShippingMethodValidator(shippingOptions);

  const result = await validator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  const { shippingOptionIds = [] } = result.data;

  await Promise.all(
    shippingOptionIds.map(
      async (id) =>
        await setShippingMethod(request, {
          cartId: data.cartId,
          shippingOptionId: id,
        }),
    ),
  );
  // THIS IS A HACK to force payment sessions to be updated
  const updatedCart = (await updateCart(request, {})).cart;

  await initiatePaymentSession(request, updatedCart, {
    provider_id: 'pp_stripe_stripe',
  });

  const cart = (await retrieveCart(request)) as StoreCart;

  return { cart };
};

const addDiscountCode: ActionHandler<StoreCartResponse> = async (
  data: { cartId: string; code: string },
  { request },
) => {
  const result = await checkoutAddDiscountCodeValidator.validate(data);

  if (result.error) throw new FormValidationError(result.error);

  try {
    const { cart } = await sdk.store.cart.update(data.cartId, {
      promo_codes: [data.code],
    });

    // if (!cart)
    //   throw new FormValidationError({
    //     fieldErrors: {
    //       formError: "Cart could not be updated. Please try again.",
    //     },
    //   })

    return { cart };
  } catch (error: any) {
    throw new FormValidationError({
      fieldErrors: { code: 'Code is invalid.' },
    });
  }
};

const completeCheckout: ActionHandler<unknown> = async (
  { noRedirect = false, ...data }: UpdatePaymentInput,
  actionArgs,
) => {
  const { request } = actionArgs;

  const result = await checkoutPaymentValidator.validate(data);

  if (!data.sameAsShipping && data.billingAddress) {
    await updateBillingAddress(data, actionArgs);
  }

  let cart = (await retrieveCart(request)) as StoreCart;

  if (data.sameAsShipping) {
    const { id, metadata, customer_id, ...billingAddress } = cart.shipping_address as StoreCartAddress;

    cart = (
      await updateCart(request, {
        billing_address: addressPayload(billingAddress as MedusaAddress) as StoreCartAddress,
      })
    )?.cart;
  }

  const activePaymentSession = cart.payment_collection?.payment_sessions?.find((ps) => ps.status === 'pending');

  if (activePaymentSession?.provider_id !== data.providerId || !cart.payment_collection?.payment_sessions?.length) {
    await initiatePaymentSession(request, cart, {
      provider_id: data.providerId,
      context: { payment_method: data.paymentMethodId },
    });
  }

  if (result.error) throw new FormValidationError(result.error);

  const isNewPaymentMethod = data.paymentMethodId === 'new';

  try {
    if (!isNewPaymentMethod && data.providerId === 'pp_stripe_stripe') {
      await initiatePaymentSession(request, cart, {
        provider_id: data.providerId,
        context: { payment_method: data.paymentMethodId },
      });
    }

    const cartResponse = await placeOrder(request);

    if (cartResponse.type === 'cart' || !cartResponse)
      throw new FormValidationError({
        fieldErrors: {
          formError: 'Cart could not be completed. Please try again.',
        },
      });

    const headers = new Headers();

    await removeCartId(headers);

    const { order } = cartResponse;

    if (noRedirect) return { order };

    return redirect(`/checkout/success?order_id=${order.id}`, { headers });
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
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleAction({ actionArgs, actions });
}

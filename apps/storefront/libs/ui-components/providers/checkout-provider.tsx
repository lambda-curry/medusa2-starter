import { PricedShippingOption } from '@markethaus/storefront-client';
import { type ContextValue } from '@utils/types';
import { PaymentMethod } from '@utils/types/payment-methods';
import {
  checkAccountDetailsComplete,
  checkContactInfoComplete,
} from '@libs/util/checkout';
import { createReducer } from '@libs/util/createReducer';
import { PaymentSession } from '@libs/util/medusa';
import {
  createContext,
  FC,
  PropsWithChildren,
  useMemo,
  useReducer,
} from 'react';
import { useCart } from '../hooks/useCart';
import { useCustomer } from '../hooks/useCustomer';
import { useEnv } from '../hooks/useEnv';

export enum CheckoutStep {
  CONTACT_INFO = 'contactInfo',
  ACCOUNT_DETAILS = 'accountDetails',
  PAYMENT = 'payment',
  SUCCESS = 'success',
}

export interface CheckoutState {
  shippingDisabled: boolean;
  step: CheckoutStep;
  shippingOptions: PricedShippingOption[];
  paymentMethods: PaymentMethod[];
  paymentSessions: PaymentSession[];
}

export type CheckoutAction = {
  name: 'setStep';
  payload: CheckoutStep;
};

export type CheckoutContextValue = ContextValue<CheckoutState, CheckoutAction>;

export interface CheckoutProviderProps extends PropsWithChildren {
  data: {
    shippingOptions: PricedShippingOption[];
    paymentMethods: PaymentMethod[];
    paymentSessions: PaymentSession[];
  };
}

export const useNextStep = (
  state: Omit<CheckoutState, 'step'>
): CheckoutStep => {
  const { cart } = useCart();
  const { customer } = useCustomer();
  const isLoggedIn = !!customer?.id;

  const contactInfoComplete = useMemo(
    () => checkContactInfoComplete(cart!, customer),
    [cart, customer]
  );
  const accountDetailsComplete = useMemo(
    () => checkAccountDetailsComplete(cart!),
    [cart, isLoggedIn]
  );

  let nextStep = CheckoutStep.ACCOUNT_DETAILS;

  if (contactInfoComplete) nextStep = CheckoutStep.ACCOUNT_DETAILS;

  if (accountDetailsComplete) nextStep = CheckoutStep.PAYMENT;

  return nextStep;
};

export const CheckoutContext = createContext<CheckoutContextValue>(null as any);

const actionHandlers = {
  setStep: (state: CheckoutState, step: CheckoutStep) => {
    return { ...state, step };
  },
};

export const reducer = createReducer<CheckoutState, CheckoutAction>({
  actionHandlers,
});

export const CheckoutProvider: FC<CheckoutProviderProps> = ({
  data,
  ...props
}) => {
  const { env } = useEnv();
  const initialStep = useNextStep({
    ...data,
    shippingDisabled: env.DISABLE_SHIPPING,
  });
  const shippingDisabled = env.DISABLE_SHIPPING;

  const initialState = {
    shippingDisabled,
    step: initialStep,
    shippingOptions: [],
    paymentMethods: [],
    paymentSessions: [],
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CheckoutContext.Provider
      value={{ state: { ...state, ...data }, dispatch }}
      {...props}
    />
  );
};

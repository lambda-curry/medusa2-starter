import { checkAccountDetailsComplete, checkContactInfoComplete } from '@libs/util/checkout';
import { createReducer } from '@libs/util/createReducer';
import { createContext, FC, PropsWithChildren, useMemo, useReducer } from 'react';
import { useCustomer } from '@app/hooks/useCustomer';
import { StoreCart, StoreCartShippingOption, StorePaymentProvider } from '@medusajs/types';
import { BasePaymentSession } from '@medusajs/types/dist/http/payment/common';
import { ContextValue } from '../../types';

export enum CheckoutStep {
  CONTACT_INFO = 'contactInfo',
  ACCOUNT_DETAILS = 'accountDetails',
  PAYMENT = 'payment',
  SUCCESS = 'success',
}

export interface CheckoutState {
  cart: StoreCart | null;
  step: CheckoutStep;
  shippingOptions: StoreCartShippingOption[];
  paymentProviders: StorePaymentProvider[];
  activePaymentSession: BasePaymentSession | null;
}

export type CheckoutAction = {
  name: 'setStep';
  payload: CheckoutStep;
};

export type CheckoutContextValue = ContextValue<CheckoutState, CheckoutAction>;

export interface CheckoutProviderProps extends PropsWithChildren {
  data: {
    cart: StoreCart | null;
    shippingOptions: StoreCartShippingOption[];
    paymentProviders: StorePaymentProvider[];
    activePaymentSession: BasePaymentSession | null;
  };
}

export const useNextStep = (state: Omit<CheckoutState, 'step'>): CheckoutStep => {
  const { cart } = state;
  const { customer } = useCustomer();
  const isLoggedIn = !!customer?.id;

  const contactInfoComplete = useMemo(() => checkContactInfoComplete(cart!, customer!), [cart, customer]);
  const accountDetailsComplete = useMemo(() => checkAccountDetailsComplete(cart!), [cart, isLoggedIn]);

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

export const CheckoutProvider: FC<CheckoutProviderProps> = ({ data, ...props }) => {
  const initialStep = useNextStep({ ...data });

  const initialState = {
    step: initialStep,
    cart: null,
    shippingOptions: [],
    paymentProviders: [],
    activePaymentSession: null,
  } as CheckoutState;

  const [state, dispatch] = useReducer(reducer, initialState);

  return <CheckoutContext.Provider value={{ state: { ...state, ...data }, dispatch }} {...props} />;
};

import { useContext } from 'react';
import { CheckoutContext, CheckoutContextValue, CheckoutStep, useNextStep } from '@app/providers/checkout-provider';

const actions = ({ dispatch }: CheckoutContextValue) => ({
  setStep: (step: CheckoutStep) => dispatch({ name: 'setStep', payload: step }),
});

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  const nextStep = useNextStep(context.state);
  const { state } = context;

  if (!state.step) throw new Error('useCheckout must be used within a CheckoutProvider');

  return {
    ...state,
    ...actions(context),
    goToNextStep: () => context.dispatch({ name: 'setStep', payload: nextStep }),
  };
};

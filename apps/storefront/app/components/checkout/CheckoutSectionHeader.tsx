import { FC, PropsWithChildren } from 'react';
import { Button } from '@app/components/common/buttons/Button';
import CheckIcon from '@heroicons/react/24/solid/CheckIcon';
import { CheckoutStep } from '@app/providers/checkout-provider';

export const CheckoutSectionHeader: FC<
  PropsWithChildren<{
    completed: boolean;
    setStep: (step: CheckoutStep) => void;
    step: CheckoutStep;
  }>
> = ({ completed, setStep, step, children }) => {
  return (
    <header className="relative flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">{children}</h2>
      {completed && (
        <>
          <Button className="text-sm" variant="link" onClick={() => setStep(step)}>
            Edit
          </Button>
          <span className="absolute -left-10 mt-0.5 hidden h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 md:flex">
            <CheckIcon className="h-4 w-4" />
          </span>
        </>
      )}
    </header>
  );
};

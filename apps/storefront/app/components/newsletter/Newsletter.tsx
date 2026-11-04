import { Alert } from '@app/components/common/alert';
import { Button } from '@app/components/common/buttons/Button';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import clsx from 'clsx';
import { type FC, useEffect, useRef } from 'react';
import { useFetcher } from 'react-router';

// The footer renders on every page, so this form uses native validation instead of
// react-hook-form + zod. Those two libraries would otherwise ship in the root chunk.
// The action still validates with zod.
export const NewsletterSubscription: FC<{ className?: string }> = ({ className }) => {
  const fetcher = useFetcher<{
    success: boolean;
    errors?: Record<string, { message: string }>;
  }>();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.data?.success) {
      formRef.current?.reset();
    }
  }, [fetcher.data]);

  const emailError = fetcher.data?.errors?.email?.message;

  return (
    <div className={clsx('card flex flex-col rounded text-white', className)}>
      {fetcher.data?.success ? (
        <Alert type="success" className="mb-2 mt-4 min-w-[280px]" title={`Thank you for subscribing!`} />
      ) : (
        <fetcher.Form ref={formRef} method="post" action="/api/newsletter-subscriptions">
          <div className="items-end gap-2 border-b border-white">
            <div className="flex flex-col text-white gap-5">
              <span className="text-lg font-bold">Newsletter</span>
              <p className="font-light">Sign up for our newsletter to only receive good things.</p>
            </div>

            <div className="flex items-end gap-2">
              <input
                type="email"
                name="email"
                required
                aria-label="Email address"
                aria-invalid={emailError ? true : undefined}
                placeholder="Enter your email"
                className="min-w-[220px] w-full text-white border-none rounded-none mt-2 pl-0 bg-transparent placeholder:text-white"
              />
              <Button type="submit" variant="ghost" className="pr-0 pl-0" disabled={fetcher.state !== 'idle'}>
                <ArrowRightIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
          {emailError && <p className="mt-2 text-sm">{emailError}</p>}
        </fetcher.Form>
      )}
    </div>
  );
};

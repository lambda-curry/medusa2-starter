import { type FC, useEffect, useRef } from 'react';
import { Form } from '@app/components/common/forms/Form';
import { Alert } from '@app/components/common/alert';
import { type FetcherWithComponents, useFetcher } from '@remix-run/react';
import { SubmitButton } from '@app/components/common/buttons';
import {
  NewsletterSubscriptionAction,
  newsletterSubscriberFormValidator,
} from '@app/routes/api.newsletter-subscriptions';
import { FieldText } from '@app/components/common/forms/fields/FieldText';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

export interface NewsletterSubscriptionFromValues {
  email: string;
}
export const NewsletterSubscription: FC<{ className?: string }> = ({ className }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<{
    success: boolean;
    fieldErrors?: Record<string, string>;
  }>() as FetcherWithComponents<{
    success: boolean;
    fieldErrors?: Record<string, string>;
  }>;

  useEffect(() => {
    if (fetcher.data?.success) {
      formRef.current?.reset();
    }
  }, [fetcher.data]);

  return (
    <div className={clsx('card flex flex-col rounded text-white', className)}>
      {fetcher.data?.success ? (
        <Alert type="success" className="mb-2 mt-4 min-w-[280px]" title={`Thank you for subscribing!`} />
      ) : (
        <Form<NewsletterSubscriptionFromValues, NewsletterSubscriptionAction.SUBSCRIBE_EMAIL>
          id="newsletterSubscriptionForm"
          method="post"
          action="/api/newsletter-subscriptions"
          subaction={NewsletterSubscriptionAction.SUBSCRIBE_EMAIL}
          validator={newsletterSubscriberFormValidator}
          fetcher={fetcher}
          formRef={formRef}
        >
          <div className="flex items-end gap-2 border-b border-white">
            <FieldText
              className="min-w-[220px]"
              label={
                <div className="flex flex-col text-white gap-5">
                  <span className="text-lg font-bold">Newsletter</span>
                  <p className="font-light">Sign up for our newsletter to only receive good things.</p>
                </div>
              }
              name="email"
              placeholder="Enter your email"
              fieldTextProps={{
                className: 'border-none rounded-none',
              }}
              inputProps={{
                className: 'mt-7 pl-0 bg-transparent placeholder:text-white',
              }}
            />
            <SubmitButton variant="ghost" className="pr-0 pl-0">
              <ArrowRightIcon className="w-5 h-5" />
            </SubmitButton>
          </div>
        </Form>
      )}
    </div>
  );
};

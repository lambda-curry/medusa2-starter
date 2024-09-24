import { type FC, useEffect, useRef } from 'react';
import { Form } from '@components/forms/Form';
import { Alert } from '@components/alert';
import { type FetcherWithComponents, useFetcher } from '@remix-run/react';
import { SubmitButton } from '@components/buttons';
import {
  NewsletterSubscriptionAction,
  newsletterSubscriberFormValidator,
} from '~/routes/api.newsletter-subscriptions';
import { FieldText } from '@components/forms/fields/FieldText';
import { Card, CardBody, CardContent } from '@components/card';

export interface NewsletterSubscriptionFromValues {
  email: string;
}
export const NewsletterSubscription: FC = () => {
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
    <div className="card flex flex-col rounded bg-[#00000005] px-3 pb-4 pt-3 shadow-inner">
      {fetcher.data?.success ? (
        <Alert
          type="success"
          className="mb-2 mt-4 min-w-[280px]"
          title={`Thank you for subscribing!`}
        />
      ) : (
        <Form<
          NewsletterSubscriptionFromValues,
          NewsletterSubscriptionAction.SUBSCRIBE_EMAIL
        >
          id="newsletterSubscriptionForm"
          method="post"
          action="/api/newsletter-subscriptions"
          subaction={NewsletterSubscriptionAction.SUBSCRIBE_EMAIL}
          validator={newsletterSubscriberFormValidator}
          fetcher={fetcher}
          formRef={formRef}
        >
          <div className="flex items-end gap-2">
            <FieldText
              className="min-w-[220px]"
              label={
                <span className="text-lg font-bold">Subscribe to updates</span>
              }
              name="email"
              placeholder="Enter your email"
            />
            <SubmitButton>Subscribe</SubmitButton>
          </div>
        </Form>
      )}
    </div>
  );
};

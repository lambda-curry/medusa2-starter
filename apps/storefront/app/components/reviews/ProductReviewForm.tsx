import { ImageUploadWithPreview, ProductReviewImage } from '@app/components/common/ImageUpload/ImageUploadWithPreview';
import { Actions } from '@app/components/common/actions';
import { Button } from '@app/components/common/buttons';
import { FieldLabel } from '@app/components/common/forms/fields/FieldLabel';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextField, Textarea } from '@lambdacurry/forms/remix-hook-form';
import { StoreProductReview } from '@lambdacurry/medusa-plugins-sdk';
import { StoreOrderLineItem } from '@medusajs/types';
import { FC, useEffect, useRef } from 'react';
import { Link, useFetcher } from 'react-router';
import { RemixFormProvider, useRemixForm } from 'remix-hook-form';
import { z } from 'zod';
import { SubmitButton } from '../common/remix-hook-form/buttons/SubmitButton';
import { FormError } from '../common/remix-hook-form/forms/FormError';
import { StarRating } from './StarRating';

const schema = z.object({
  id: z.string().optional(),
  order_id: z.string().min(1, 'Order is required'),
  order_line_item_id: z.string().min(1, 'Line item is required'),
  rating: z.number().min(1, 'Rating is required'),
  content: z.string().optional().default(''),
  existing_images: z.string().optional(),
  review_request_id: z.string().optional(),
});

type ProductReviewFormInput = z.input<typeof schema>;
type ProductReviewFormData = z.output<typeof schema>;

export interface ProductReviewFormValues {
  id?: string;
  rating?: number;
  content?: string;
  images?: ProductReviewImage[];
  order_line_item_id: string;
  order_id: string;
}

export interface ProductReviewFormProps {
  redirect?: string;
  onSuccess?: () => void;
  setEditing: (value: boolean) => void;
  productReview?: StoreProductReview;
  requestId?: string;
  lineItem: StoreOrderLineItem;
  orderId: string;
}

export const ProductReviewForm: FC<ProductReviewFormProps> = ({
  setEditing,
  productReview,
  requestId,
  lineItem,
  orderId,
}) => {
  const isComplete = productReview?.id;

  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.success) {
      setEditing(false);
    }
  }, [fetcher.data?.success]);

  const formRef = useRef<HTMLFormElement>(null);

  const defaultValues = productReview
    ? { rating: productReview.rating, content: productReview.content }
    : { rating: 5, content: '' };

  const existingImages = productReview?.images || [];

  const form = useRemixForm<ProductReviewFormInput, any, ProductReviewFormData>({
    resolver: zodResolver(schema),
    fetcher,
    submitHandlers: {
      onValid: (data) => {
        fetcher.submit(formRef.current, {
          method: 'post',
          action: '/api/product-reviews/upsert',
          encType: 'multipart/form-data',
        });
      },
    },
    submitConfig: {
      method: 'post',
      encType: 'multipart/form-data',
      action: '/api/product-reviews/upsert',
    },
    defaultValues: {
      ...defaultValues,
      order_id: orderId,
      order_line_item_id: lineItem.id,
      id: productReview?.id,
      review_request_id: requestId,
    },
  });

  const ratingValue = form.watch('rating');

  return (
    <RemixFormProvider {...form}>
      <fetcher.Form ref={formRef} onSubmit={form.handleSubmit}>
        <FormError className="mt-0" />

        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h3 className="text-base text-gray-900">
              <Link to={`/products/${lineItem.variant?.product?.handle}`}>{lineItem.title}</Link>
            </h3>

            <p className="text-sm font-normal text-gray-500">{lineItem.variant?.title}</p>
          </div>

          <div>
            <FieldLabel htmlFor="rating">Select a rating</FieldLabel>
            <StarRating onChange={(value: number) => form.setValue('rating', value)} value={ratingValue} />
          </div>
        </div>

        <TextField type="hidden" name="rating" value={ratingValue} />
        <TextField type="hidden" name="order_id" value={orderId} />
        <TextField type="hidden" name="order_line_item_id" value={lineItem.id} />
        {requestId && <TextField type="hidden" name="review_request_id" value={requestId} />}
        {isComplete && <TextField type="hidden" name="id" value={productReview.id} />}

        <ImageUploadWithPreview existingImages={existingImages} className="mb-2 mt-6" />

        <Textarea name="content" placeholder="Add your review" className="sm:col-span-12" />

        <Actions>
          {isComplete && <Button onClick={() => setEditing(false)}>Cancel</Button>}
          <SubmitButton>{isComplete ? 'Save' : 'Submit Review'}</SubmitButton>
        </Actions>
      </fetcher.Form>
    </RemixFormProvider>
  );
};

import { Actions } from '@components/actions';
import { Button, SubmitButton } from '@components/buttons';
import { Form } from '@components/forms/Form';
import { FormError } from '@components/forms/FormError';
import { FieldTextarea } from '@components/forms/fields/FieldTextarea';
import { LineItem, ProductReview } from '@marketplace/util/medusa/types';
import { FetcherWithComponents, Link, useFetcher } from '@remix-run/react';
import { withYup } from '@remix-validated-form/with-yup';
import { FC } from 'react';
import { useControlField } from 'remix-validated-form';
import * as Yup from 'yup';
import { ProductReviewAction } from '~/routes/api.product-reviews';
import { ImageUploadWithPreview } from '@components/ImageUpload/ImageUploadWithPreview';
import { StarRating } from './StarRating';
import { FieldLabel } from '@components/forms/fields/FieldLabel';

export interface ProductReviewFormValues {
  id?: string;
  rating?: number;
  content?: string;
  images?: MedusaImage[];
  product_id: string;
}

export interface MedusaImage {
  created_at: string;
  deleted_at: string;
  id: string;
  metadata: string;
  updated_at: string;
  url: string;
}

export interface ProductReviewFormProps {
  redirect?: string;
  onSuccess?: () => void;
  setEditing: (value: boolean) => void;
  productReview?: ProductReview;
  requestId?: string;
  lineItem: LineItem;
}

export const ProductReviewFormValidator = withYup(
  Yup.object().shape({
    id: Yup.string().optional(),
    product_id: Yup.string().required(),
    rating: Yup.number().optional(),
    content: Yup.string().optional(),
  })
);

export const ProductReviewForm: FC<ProductReviewFormProps> = ({
  setEditing,
  productReview,
  requestId,
  lineItem,
}) => {
  const isComplete = productReview?.id;

  const fetcher = useFetcher<{}>() as FetcherWithComponents<{}>;
  const product_id = lineItem?.variant?.product_id;

  const defaultValues = productReview
    ? {
        rating: productReview.rating,
        content: productReview.content,
        images: productReview.images,
      }
    : { rating: 5, comment: '' };

  const formId = `product-review-form-${lineItem.id}`;
  const [ratingValue, setRatingValue] = useControlField<number>(
    'rating',
    formId
  );

  const existingImages = productReview?.images;

  return (
    <Form<
      ProductReviewFormValues,
      ProductReviewAction.EDIT_REVIEW | ProductReviewAction.CREATE_REVIEW
    >
      id={formId}
      encType="multipart/form-data"
      method="post"
      action="/api/product-reviews"
      subaction={
        productReview?.id
          ? ProductReviewAction.EDIT_REVIEW
          : ProductReviewAction.CREATE_REVIEW
      }
      fetcher={fetcher}
      validator={ProductReviewFormValidator}
      onSubmit={() => setEditing(false)}
      defaultValues={defaultValues}
    >
      <FormError className="mt-0" />
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h3 className="text-base text-gray-900">
            <Link to={`/products/${lineItem.variant?.product?.handle}`}>
              {lineItem.title}
            </Link>
          </h3>

          <p className="text-sm font-normal text-gray-500">
            {lineItem.variant?.title}
          </p>
        </div>

        <div>
          <FieldLabel htmlFor="rating">Select a rating</FieldLabel>
          <StarRating onChange={setRatingValue} value={ratingValue} />
        </div>
      </div>

      {isComplete && <input type="hidden" name="id" value={productReview.id} />}
      <input type="hidden" name="rating" value={ratingValue} />
      <input type="hidden" name="product_id" value={product_id} />
      {requestId && (
        <input type="hidden" name="review_request_id" value={requestId} />
      )}

      <ImageUploadWithPreview
        existingImages={existingImages}
        className="mb-2 mt-6"
      />

      <FieldTextarea
        name="content"
        placeholder="Add your review"
        className="sm:col-span-12"
      />
      <Actions>
        {isComplete && (
          <Button onClick={() => setEditing(false)}>Cancel</Button>
        )}
        <SubmitButton>{isComplete ? 'Save' : 'Submit Review'}</SubmitButton>
      </Actions>
    </Form>
  );
};

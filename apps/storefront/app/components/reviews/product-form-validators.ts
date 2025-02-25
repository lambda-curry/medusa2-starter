import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';

export const productReviewSchema = Yup.object({
  id: Yup.string().optional(),
  order_id: Yup.string().required('Order is required'),
  order_line_item_id: Yup.string().required('Line item is required'),
  rating: Yup.number()
    .transform((value) => Number(value))
    .required('Rating is required'),
  content: Yup.string().optional().default(''),
  existing_images: Yup.string().optional(),
});

export const upsertProductReviewsValidator = withYup(productReviewSchema);

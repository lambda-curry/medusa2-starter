import {
  V2ActionHandler,
  handleActionV2,
} from '@marketplace/util/handleAction.server';
import {
  CreateProductReviewReq,
  EditProductReviewReq,
} from '@marketplace/util/medusa';
import {
  createMedusaClient,
  type Medusa,
} from '@marketplace/util/medusa/client.server';
import {
  createProductReviewValidation,
  updateProductReviewValidation,
} from '@marketplace/util/validation';
import { ActionFunctionArgs, NodeOnDiskFile } from '@remix-run/node';
import { withYup } from '@remix-validated-form/with-yup';
import * as Yup from 'yup';
import { FormValidationError } from '@utils/validation/validation-error';

export enum ProductReviewAction {
  CREATE_REVIEW = 'createReview',
  EDIT_REVIEW = 'editReview',
}

const uploadImages = async (
  images: NodeOnDiskFile | NodeOnDiskFile[] | null | undefined,
  client: Medusa
): Promise<string[]> => {
  if (!images) return [];
  if (images && !Array.isArray(images)) images = [images];
  if (!Array.isArray(images)) return [];
  if (!images?.length) return [];
  const response = await client.productReviews.uploadImages(images);
  if (!response) return [];
  return Array.isArray(response.uploads)
    ? response.uploads.map(i => i.url)
    : [response.uploads.url];
};

const createReview: V2ActionHandler = async (
  data: Omit<CreateProductReviewReq, 'images'> & { images: NodeOnDiskFile[] },
  actionArgs
) => {
  const client = await createMedusaClient(actionArgs);

  const validator = withYup(Yup.object().shape(createProductReviewValidation));

  const { product_id, rating, content } = data;

  const result = await validator.validate({ product_id, rating, content });

  if (result.error) throw new FormValidationError(result.error);

  if (data?.__rvfInternalFormId) delete data.__rvfInternalFormId;

  const imageUrls = await uploadImages(data.images ?? [], client);

  const createReturn = await client.productReviews.create({
    ...data,
    images: imageUrls,
  });

  return { product_review: createReturn.review };
};

const editReview: V2ActionHandler = async (
  data: Omit<EditProductReviewReq, 'images'> & { images: NodeOnDiskFile[] },
  actionArgs
) => {
  const client = await createMedusaClient(actionArgs);

  const validator = withYup(Yup.object().shape(updateProductReviewValidation));

  const { id, product_id, rating, content } = data;

  const result = await validator.validate({ id, product_id, rating, content });

  if (result.error) throw new FormValidationError(result.error);
  if (data?.__rvfInternalFormId) delete data.__rvfInternalFormId;

  const imageUrls = await uploadImages(data.images ?? [], client);

  const editReturn = await client.productReviews.update({
    ...data,
    images: imageUrls,
  });

  return { product_review: editReturn?.review };
};

const actions = {
  createReview,
  editReview,
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleActionV2({ actionArgs, actions });
}

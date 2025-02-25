import { type ActionHandler, handleAction } from '@libs/util/handleAction.server';
import { FormValidationError } from '@libs/util/validation/validation-error';
import type { ActionFunctionArgs, NodeOnDiskFile } from '@remix-run/node';
import { upsertProductReviewsValidator } from '@app/components/reviews/product-form-validators';
import { StoreUpsertProductReviewsDTO } from '@lambdacurry/medusa-plugins-sdk';
import { upsertProductReviews } from '@libs/util/server/data/product-reviews.server';
import { createReadStream } from 'fs';
import { baseMedusaConfig } from '@libs/util/server/client.server';

export enum ProductReviewAction {
  UPSERT_PRODUCT_REVIEWS = 'upsertProductReviews',
}

const uploadImages = async (_images: NodeOnDiskFile | NodeOnDiskFile[] | null | undefined): Promise<string[]> => {
  if (!_images) return [];
  if (_images && !Array.isArray(_images)) _images = [_images];
  if (!Array.isArray(_images)) return [];
  if (!_images?.length) return [];
  const images = _images.filter((image) => image.size > 0);
  if (!images.length) return [];

  const formData = new FormData();

  for (const image of images) {
    const fileBuffer = await readFileAsBuffer(image.getFilePath());
    const blob = new Blob([fileBuffer], { type: image.type || 'application/octet-stream' });
    formData.append('files', blob, image.name);
  }

  const url = new URL('/store/product-reviews/uploads', baseMedusaConfig.baseUrl);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    headers: {
      'x-publishable-api-key': baseMedusaConfig.publishableKey ?? '',
    },
  });

  if (!response.ok) {
    console.error('Upload failed with status:', response.status);
    const errorText = await response.text();
    console.error('Error details:', errorText);
    return [];
  }

  const data = (await response.json()) as { files: { id: string; url: string }[] };

  return data.files.map((i) => i.url);
};

const upsertProductReviewsHandler: ActionHandler<unknown> = async (
  data: Omit<StoreUpsertProductReviewsDTO['reviews'][number], 'images'> & {
    images: NodeOnDiskFile[];
    existing_images?: string;
  },
  actionArgs,
) => {
  const { request } = actionArgs;

  const { order_id, order_line_item_id, rating, content, images, existing_images } = data;

  const payload = {
    order_id,
    order_line_item_id,
    rating: Number(rating),
    content,
    existing_images,
  };

  const result = await upsertProductReviewsValidator.validate(payload);

  if (result.error) throw new FormValidationError(result.error);

  try {
    const { existing_images, ...upsertPayload } = result.data;

    const newImageUrls = await uploadImages(images ?? []);

    const existingImageUrls = existing_images?.split(',').map((url) => url.trim()) || [];

    const allImageUrls = [...newImageUrls, ...existingImageUrls];

    const { product_reviews } = await upsertProductReviews(request, {
      reviews: [
        {
          ...upsertPayload,
          images: allImageUrls.map((url) => ({ url })),
        },
      ],
    });

    return product_reviews;
  } catch (error: any) {
    if (error instanceof Response) throw error;
    if (error instanceof FormValidationError) throw error;

    console.error('product reviews error', error);

    throw new FormValidationError({
      fieldErrors: {
        formError: 'Something went wrong when creating or updating your product reviews.',
      },
    });
  }
};

const actions = {
  upsertProductReviews: upsertProductReviewsHandler,
};

export async function action(actionArgs: ActionFunctionArgs) {
  return await handleAction({ actionArgs, actions });
}

async function readFileAsBuffer(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

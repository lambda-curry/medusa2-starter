import { zodResolver } from '@hookform/resolvers/zod';
import { getVariantBySelectedOptions } from '@libs/util/products';
import { setCartId } from '@libs/util/server/cookies.server';
import { addToCart } from '@libs/util/server/data/cart.server';
import { getProductsById } from '@libs/util/server/data/products.server';
import { getSelectedRegion } from '@libs/util/server/data/regions.server';
import { FieldErrors } from 'react-hook-form';
import { type ActionFunctionArgs, data } from 'react-router';
import { getValidatedFormData } from 'remix-hook-form';
import { z } from 'zod';

export const createLineItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  options: z.record(z.string(), z.string()).default({}),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

type CreateLineItemFormData = z.infer<typeof createLineItemSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const { errors, data: validatedFormData } = await getValidatedFormData<CreateLineItemFormData>(
    request,
    zodResolver(createLineItemSchema),
  );

  if (errors) {
    return data({ errors }, { status: 400 });
  }

  const { productId, options, quantity } = validatedFormData;

  const region = await getSelectedRegion(request.headers);

  const [product] = await getProductsById({
    ids: [productId],
    regionId: region.id,
  }).catch(() => []);

  if (!product) {
    return data({ errors: { root: { message: 'Product not found.' } } as FieldErrors }, { status: 400 });
  }

  const variant = getVariantBySelectedOptions(product.variants || [], options);

  if (!variant) {
    return data(
      {
        errors: {
          root: {
            message: 'Product variant not found. Please select all required options.',
          },
        },
      },
      { status: 400 },
    );
  }

  const responseHeaders = new Headers();

  const { cart } = await addToCart(request, {
    variantId: variant.id!,
    quantity,
  });

  await setCartId(responseHeaders, cart.id);

  return data({ cart }, { headers: responseHeaders });
}

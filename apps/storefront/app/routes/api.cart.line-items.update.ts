import { zodResolver } from '@hookform/resolvers/zod';
import { updateLineItem } from '@libs/util/server/data/cart.server';
import { type ActionFunctionArgs, data } from 'react-router';
import { getValidatedFormData } from 'remix-hook-form';
import { z } from 'zod';

export const updateLineItemSchema = z.object({
  lineItemId: z.string().min(1, 'Line item ID is required'),
  quantity: z.coerce.number().int(),
});

type UpdateLineItemFormData = z.infer<typeof updateLineItemSchema>;
type UpdateLineItemFormInput = z.input<typeof updateLineItemSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const { errors, data: validatedFormData } = await getValidatedFormData<
    UpdateLineItemFormInput,
    any,
    UpdateLineItemFormData
  >(request, zodResolver(updateLineItemSchema));

  if (errors) {
    return data({ errors }, { status: 400 });
  }

  const { lineItemId, quantity } = validatedFormData;

  const response = await updateLineItem(request, {
    lineId: lineItemId,
    quantity,
  });

  return data(response);
}

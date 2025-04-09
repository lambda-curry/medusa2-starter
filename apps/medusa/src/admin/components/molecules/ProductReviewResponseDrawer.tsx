import { AdminProductReview } from '@markethaus/types';
import { Button, Label, Text, Textarea } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Drawer } from '@medusajs/ui';
import {
  useAdminCreateProductReviewResponseMutation,
  useAdminUpdateProductReviewResponseMutation,
} from '../hooks/product-review';

const schema = z.object({
  content: z
    .string()
    .min(1)
    .refine((val) => val.trim().split(/\s+/).length >= 1, {
      message: 'Response must contain at least one word',
    }),
});

type FormValues = z.infer<typeof schema>;

export const ProductReviewResponseDrawer = ({
  review,
  open,
  setOpen,
}: { review: AdminProductReview | null; open: boolean; setOpen: (open: boolean) => void }) => {
  const title = review?.response ? 'Edit Response' : 'Add Response';

  const { mutate: createResponse } = useAdminCreateProductReviewResponseMutation(review?.id ?? '');
  const { mutate: updateResponse } = useAdminUpdateProductReviewResponseMutation(review?.id ?? '');

  const form = useForm<FormValues>({
    defaultValues: {
      content: review?.response?.content ?? '',
    },
    resolver: zodResolver(schema),
  });

  if (!review) return null;

  const onSubmit = async (data: FormValues) => {
    if (review.response) {
      await updateResponse(data);
    } else {
      await createResponse(data);
    }
    setOpen(false);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title className="font-medium">{title}</Drawer.Title>
        </Drawer.Header>

        <Drawer.Body className="p-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label className="font-medium">Response</Label>
              <Textarea placeholder="Write your response..." rows={4} {...form.register('content')} />
              {form.formState.errors.content && (
                <Text className="text-red-500" size="small">
                  {form.formState.errors.content.message}
                </Text>
              )}
            </div>
          </form>
        </Drawer.Body>

        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Cancel</Button>
          </Drawer.Close>

          <Button onClick={form.handleSubmit(onSubmit)}>Save</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

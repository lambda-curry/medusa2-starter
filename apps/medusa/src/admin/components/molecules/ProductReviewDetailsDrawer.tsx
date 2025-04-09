import { AdminProductReview } from '@markethaus/types';
import { Button, Container, Drawer, Text } from '@medusajs/ui';
import { DateTime } from 'luxon';
import { Link } from 'react-router-dom';
import { ReviewStars } from '../atoms/review-stars';
import { SectionRow } from '../atoms/section-row';

export const ProductReviewDetailsDrawer = ({
  review,
  open,
  setOpen,
}: {
  review: AdminProductReview | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  if (!review) return null;

  const ProductValue = () => (
    <div className="flex items-center gap-4">
      {review.product.thumbnail ? (
        <img className="h-12 w-12 flex-shrink-0 rounded-md" src={review.product.thumbnail} alt={review.product.title} />
      ) : (
        <div className="h-12 w-12 flex-shrink-0 rounded-md bg-gray-200" />
      )}
      <Link to={`/products/${review.product.id}`}>
        <Text className="hover:underline">{review.product.title}</Text>
      </Link>
    </div>
  );

  const OrderValue = () => (
    <Link to={`/orders/${review.order.id}`}>
      <Text className="hover:underline">#{review.order.display_id}</Text>
    </Link>
  );

  const CreatedAtValue = () => (
    <Text className="text-ui-fg-subtle text-sm">
      {DateTime.fromISO(review.created_at).toFormat('LLL dd yyyy hh:mm a')}
    </Text>
  );

  const CustomerValue = () => (
    <div className="flex flex-col gap-1">
      <Text>{review.name}</Text>
    </div>
  );

  const ReviewContent = () => (
    <div className="flex flex-col gap-2">
      <Text className="whitespace-pre-wrap">{review.content}</Text>
    </div>
  );

  const ImagesValue = () => (
    <div className="grid grid-cols-3 gap-2">
      {review.images.map((image, index) => (
        <img src={image.url} alt={`Review image ${index + 1}`} className="w-full h-full object-cover" />
      ))}
    </div>
  );

  const ResponseValue = () => (
    <div className="flex flex-col gap-1">
      <Text className="whitespace-pre-wrap">{review.response?.content}</Text>
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title className="font-medium">Review Details</Drawer.Title>
        </Drawer.Header>

        <Drawer.Body className="flex flex-col divide-y">
          <SectionRow title="Customer" value={<CustomerValue />} />
          <SectionRow title="Created At" value={<CreatedAtValue />} />
          <SectionRow title="Product" value={<ProductValue />} />
          <SectionRow title="Order" value={<OrderValue />} />
          <SectionRow title="Rating" value={<ReviewStars rating={review.rating} />} />
          <SectionRow title="Review" value={<ReviewContent />} />
          {review.images.length > 0 && <SectionRow title="Images" value={<ImagesValue />} />}

          <SectionRow title="Response" value={review.response ? <ResponseValue /> : <Text>No response</Text>} />
          {!!review.response?.created_at && (
            <SectionRow
              title="Responded At"
              value={<Text>{DateTime.fromISO(review.response.created_at).toFormat('LLL dd yyyy hh:mm a')}</Text>}
            />
          )}
        </Drawer.Body>

        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button variant="secondary">Close</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
};

import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { AdminOrder, DetailWidgetProps } from '@medusajs/framework/types';
import { Container } from '../components/atoms/container';
import { ProductReviewDataTable } from '../components/molecules/ProductReviewDataTable';

const OrderDetailsProductReviewsWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  return (
    <Container className="mb-2">
      <ProductReviewDataTable defaultQuery={{ order_id: order.id }} />
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: 'order.details.after',
});

export default OrderDetailsProductReviewsWidget;

import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { AdminOrder, AdminProduct, DetailWidgetProps } from '@medusajs/framework/types';
import { Container } from '../components/atoms/container';
import { ProductReviewDataTable } from '../components/molecules/ProductReviewDataTable';

const OrderDetailsProductReviewsWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  return (
    <Container className="mb-2">
      <ProductReviewDataTable defaultQuery={{ product_id: product.id }} />
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: 'product.details.after',
});

export default OrderDetailsProductReviewsWidget;

import { Order } from '@markethaus/storefront-client';
import { StatusIndicator } from './StatusIndicator';

export const FulfillmentStatus = ({ status }: { status: Order['fulfillment_status'] }) => {
  switch (status) {
    case 'returned':
      return <StatusIndicator title="Returned" variant="success" />;
    case 'fulfilled':
      return <StatusIndicator title="Completed" variant="success" />;
    case 'shipped':
      return <StatusIndicator title="Shipped" variant="primary" />;
    case 'not_fulfilled':
      return <StatusIndicator title="Processing" variant="default" />;
    case 'partially_fulfilled':
      return <StatusIndicator title="Partially Completed" variant="active" />;
    case 'partially_returned':
      return <StatusIndicator title="Partially Returned" variant="warning" />;
    case 'canceled':
      return <StatusIndicator title="Canceled" variant="danger" />;
    case 'requires_action':
      return <StatusIndicator title="Requires Action" variant="warning" />;
    default:
      return null;
  }
};

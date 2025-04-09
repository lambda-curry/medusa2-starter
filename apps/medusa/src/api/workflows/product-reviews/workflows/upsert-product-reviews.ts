import { MedusaError } from '@medusajs/framework/utils';
import { transform } from '@medusajs/framework/workflows-sdk';
import { useRemoteQueryStep } from '@medusajs/medusa/core-flows';
import { CustomerDTO, OrderDTO, OrderLineItemDTO } from '@medusajs/types';
import { type WorkflowData, WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import { ProductReviewModel } from '../../../modules/product-review/types/common';
import { createProductReviewsWorkflow } from './create-product-reviews';
import { updateProductReviewsWorkflow } from './update-product-reviews';

export type UpsertProductReviewsWorkflowInput = {
  reviews: {
    order_id: string;
    order_item_id: string;
    rating: number;
    content: string;
    images: { url: string }[];
  }[];
};

export const upsertProductReviewsWorkflow = createWorkflow(
  'upsert-product-reviews-workflow',
  (input: WorkflowData<UpsertProductReviewsWorkflowInput>) => {
    const orderIds = transform({ input }, ({ input }) => {
      return input.reviews.map((review) => review.order_id);
    });

    const orderItems: WorkflowData<
      (OrderLineItemDTO & { order: OrderDTO & { customer?: CustomerDTO }; product_review?: ProductReviewModel })[]
    > = useRemoteQueryStep({
      entry_point: 'order_items',
      fields: ['*', 'product_review', '*.order.shipping_address', '*.order.email', '*.order.customer'],
      variables: {
        id: orderIds,
      },
      list: true,
    });

    const inputs = transform({ orderItems, input }, ({ orderItems, input }) => {
      const matchedReviews = input.reviews.map((review) => {
        const orderItem = orderItems.find((item) => item.id === review.order_item_id);

        if (!orderItem) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Order item ${review.order_item_id} not found in order ${review.order_id}`,
          );
        }

        return { review, orderItem };
      });

      const getNameFromOrder = (order: OrderDTO & { customer?: CustomerDTO }) => {
        return order.customer?.first_name
          ? `${order.customer.first_name} ${order.customer.last_name}`
          : order.shipping_address?.first_name
            ? `${order.shipping_address.first_name} ${order.shipping_address.last_name}`
            : undefined;
      };

      const create = matchedReviews
        .filter((review) => !review.orderItem.product_review)
        .map(({ review, orderItem }) => {
          return {
            email: orderItem.order.email,
            name: getNameFromOrder(orderItem.order),
            product_id: orderItem.product_id,
            order_id: review.order_id,
            order_item_id: review.order_item_id,
            rating: review.rating,
            content: review.content,
            images: review.images,
          };
        });

      const update = matchedReviews
        .filter((review) => review.orderItem.product_review?.id)
        .map(({ review, orderItem }) => {
          return {
            id: orderItem.product_review!.id,
            rating: review.rating,
            content: review.content,
            images: review.images,
          };
        });

      return { create, update };
    });

    const createResult = createProductReviewsWorkflow.runAsStep({ input: { productReviews: inputs.create } });

    const updateResult = updateProductReviewsWorkflow.runAsStep({ input: { productReviews: inputs.update } });

    return new WorkflowResponse({ creates: createResult, updates: updateResult });
  },
);

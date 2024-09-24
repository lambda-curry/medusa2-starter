// import { PaymentMethodsResource as MedusaPaymentMethodsResource } from '@medusajs/medusa-js';
// import { StoreCustomerPaymentMethodsDeleteRes } from '../types';
// import { CancelablePromise } from '@markethaus/storefront-client';

// export class PaymentMethodsResource extends MedusaPaymentMethodsResource {
//   delete(
//     paymentProviderId: string,
//     paymentMethodId: string,
//     customHeaders: Record<string, any> = {}
//   ): CancelablePromise<StoreCustomerPaymentMethodsDeleteRes> {
//     const path = `/store/customers/me/payment-methods/${paymentProviderId}/${paymentMethodId}`;

//     return this.client.request('DELETE', path, {}, {}, customHeaders);
//   }
// }

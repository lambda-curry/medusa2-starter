import { ResponsePromise } from '@medusajs/medusa-js';
import { PaymentMethodsResource as MedusaPaymentMethodsResource } from '@medusajs/medusa-js';
import { StoreCustomerPaymentMethodsDeleteRes } from '../types';

export class PaymentMethodsResource extends MedusaPaymentMethodsResource {
  delete(
    paymentProviderId: string,
    paymentMethodId: string,
    customHeaders: Record<string, any> = {}
  ): ResponsePromise<StoreCustomerPaymentMethodsDeleteRes> {
    const path = `/store/customers/me/payment-methods/${paymentProviderId}/${paymentMethodId}`;

    return this.client.request('DELETE', path, {}, {}, customHeaders);
  }
}

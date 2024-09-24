// import { type Vendor } from '@marketplace/util/medusa/types';
// import {
//   ShippingProfile as MedusaShippingProfile,
//   StoreGetProductsParams as MedusaStoreGetProductsParams,
//   Store as MedusaStore,
//   Image as MedusaImage,
//   StorePostCartsCartLineItemsReq as MedusaStorePostCartsCartLineItemsReq,
//   LineItem as MedusaLineItem,
//   Product as MedusaProduct,
//   Address as MedusaAddress,
//   Order as MedusaOrder,
//   Image as MedusaImage,
//   ProductType as MedusaProductType,
//   ProductCategory as MedusaProductCategory
// } from '@medusajs/medusa';
// import { PricedProduct as MedusaPricedProduct } from '@medusajs/medusa/dist/types/pricing';

// declare module '@medusajs/medusa' {
//   export interface Store extends Omit<MedusaStore, 'beforeInsert'> {
//     logo?: MedusaImage;
//     created_at: string;
//     updated_at: string;
//     metadata: Record<string, string>;
//   }

//   export interface Address extends MedusaAddress {
//     created_at: string;
//     updated_at: string;
//     metadata: Record<string, string>;
//   }

//   export interface StoreGetProductsParams extends MedusaStoreGetProductsParams {
//     vendor_id?: string | string[];
//   }

//   export interface Product extends MedusaProduct {
//     vendor_id?: string;
//     vendor: Vendor;
//     customer_response_prompt: string | null;
//     customer_response_prompt_required?: boolean;
//     customer_file_uploads_enabled?: boolean;
//     metadata: Record<string, string>;
//   }

//   export interface ShippingProfile extends MedusaShippingProfile {
//     vendor_id: string;
//     metadata: Record<string, string>;
//   }

//   export interface StorePostCartsCartLineItemsReq extends MedusaStorePostCartsCartLineItemsReq {
//     customer_product_response?: string | null;
//     customer_file_uploads?:
//       | {
//           url: string;
//           alt?: string;
//           name?: string;
//         }[]
//       | []
//       | null;
//   }

//   export interface LineItem extends MedusaLineItem {
//     customer_product_response: string | null;
//     customer_file_uploads?:
//       | {
//           url: string;
//           alt?: string;
//           name?: string;
//         }[]
//       | []
//       | null;
//     metadata: unknown;
//   }

//   export interface Order extends MedusaOrder {
//     created_at: string;
//     updated_at: string;
//     metadata: Record<string, string>;
//   }

//   export interface Image extends MedusaImage {
//     created_at: string;
//     updated_at: string;
//     metadata: Record<string, string> | undefined;
//   }

//   export interface ProductType extends MedusaProductType {
//     metadata: Record<string, string>;
//   }

//   export interface ProductCategory extends MedusaProductCategory {
//     is_active: boolean;
//   }
// }

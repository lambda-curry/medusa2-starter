import { StoreProduct } from '@medusajs/types';
import { useMemo } from 'react';

export const useProductInventory = (product: StoreProduct) => {
  return useMemo(() => {
    const totalInventory =
      product.variants?.reduce((total, variant) => {
        if (variant.allow_backorder || !variant.manage_inventory) return Infinity;
        return total + (variant.inventory_quantity || 0);
      }, 0) ?? 0;
    const averageInventory = totalInventory / (product?.variants?.length ?? 1);

    return { averageInventory, totalInventory };
  }, [product]);
};

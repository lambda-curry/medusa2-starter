import { Container, Text } from '@medusajs/ui';
import { ProductDTO } from '@medusajs/types';
import { ProductCard } from './product-card';

interface ProductListProps {
  products: ProductDTO[];
  count?: number;
}

export const ProductList = ({ products, count }: ProductListProps) => {
  return (
    <div className="w-full">
      <div className="px-4 pb-2">
        {count !== undefined && (
          <Text className="text-ui-fg-subtle text-xs">
            Found {count} product{count !== 1 ? 's' : ''}
          </Text>
        )}
      </div>

      <div className="overflow-x-auto pb-2 px-4">
        <div className="flex gap-4 w-max">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[280px] flex-none border border-ui-border-base rounded-lg overflow-hidden"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

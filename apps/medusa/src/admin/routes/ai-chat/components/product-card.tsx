import { Text, Heading, Badge } from '@medusajs/ui';
import { ProductDTO, ProductVariantDTO, CalculatedPriceSet } from '@medusajs/types';
import { Link } from 'react-router-dom';

interface ProductVariantWithComputedPrice extends ProductVariantDTO {
  calculated_price?: CalculatedPriceSet;
}

interface ProductCardProps {
  product: ProductDTO & {
    variants: ProductVariantWithComputedPrice[];
  };
}

const formatPrice = (amount: number | null | undefined, currencyCode: string | null | undefined): string => {
  if (!amount || !currencyCode) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

const getPriceRange = (variants: ProductVariantWithComputedPrice[]): string => {
  if (!variants?.length) return '';
  if (!variants.some((v) => v.calculated_price)) return '';

  const prices = variants
    .map((v) => ({
      amount: v.calculated_price?.calculated_amount,
      currency: v.calculated_price?.currency_code,
    }))
    .filter((p) => p.amount !== null && p.currency !== null);

  if (!prices.length) return '';

  const minPrice = Math.min(...prices.map((p) => p.amount as number));
  const maxPrice = Math.max(...prices.map((p) => p.amount as number));
  const currency = prices[0].currency;

  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency);
  }

  return `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link target="_blank" to={`/products/${product.id}`} className="block no-underline h-full">
      <div className="h-full p-4 hover:bg-ui-bg-subtle transition-colors">
        <div className="flex flex-col gap-3">
          <div className="relative">
            {product.thumbnail && (
              <div className="w-full aspect-square">
                <img src={product.thumbnail} alt={product.title} className="w-full h-full object-cover rounded-lg" />
              </div>
            )}
            <Badge
              size="xsmall"
              className={`absolute top-2 right-2 text-xs px-2 py-1 ${
                product.status === 'published'
                  ? 'bg-ui-tag-green-bg text-ui-tag-green-text'
                  : 'bg-ui-tag-red-bg text-ui-tag-red-text'
              }`}
            >
              {product.status}
            </Badge>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <Heading level="h2" className="text-ui-fg-base text-sm line-clamp-2 min-h-10">
                {product.title}
              </Heading>
              {product.collection && (
                <Text size="small" className="text-ui-fg-subtle">
                  {product.collection.title}
                </Text>
              )}
            </div>
            <Text className="mt-2 text-ui-fg-base font-medium">{getPriceRange(product.variants)}</Text>
            <Text className="mt-2 text-ui-fg-subtle line-clamp-2">{product.description}</Text>
            {product.variants && product.variants.length > 0 && (
              <div className="mt-2">
                <Text size="small" className="text-ui-fg-muted line-clamp-1">
                  Variants: {product.variants.map((v: ProductVariantDTO) => v.title).join(', ')}
                </Text>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

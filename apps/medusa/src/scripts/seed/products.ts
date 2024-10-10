import {
  CreateProductWorkflowInputDTO,
  ProductTagDTO,
} from '@medusajs/framework/types';
import { ProductStatus } from '@medusajs/utils';

const buildBaseProductData = ({
  sales_channels,
  sku,
  prices: { usd, cad },
}: {
  sales_channels: { id: string }[];
  sku: string;
  prices: {
    usd: number;
    cad: number;
  };
}) => ({
  options: [
    {
      title: 'Grind',
      values: ['Whole Bean', 'Ground'],
    },
    {
      title: 'Size',
      values: ['16oz'],
    },
  ],
  sales_channels: sales_channels.map(({ id }) => ({
    id,
  })),
  variants: [
    {
      title: 'Whole Bean',
      sku: `${sku}-WHOLE-BEAN`,
      options: {
        Grind: 'Whole Bean',
        Size: '16oz',
      },
      manage_inventory: false,
      prices: [
        {
          amount: cad,
          currency_code: 'cad',
        },
        {
          amount: usd,
          currency_code: 'usd',
        },
      ],
    },
    {
      title: 'Ground',
      sku: `${sku}-GROUND`,
      options: {
        Grind: 'Ground',
        Size: '16oz',
      },
      manage_inventory: false,
      prices: [
        {
          amount: cad,
          currency_code: 'cad',
        },
        {
          amount: usd,
          currency_code: 'usd',
        },
      ],
    },
  ],
});

export const seedProducts = ({
  tags,
  sales_channels,
  categories,
}: {
  tags: ProductTagDTO[];
  categories: { id: string; name: string }[];
  sales_channels: { id: string }[];
}): CreateProductWorkflowInputDTO[] => [
  {
    title: 'Barrio Blend - Medium Roast',
    description:
      'Our signature blend, medium-dark roasted with a hint of sweetness.',
    handle: 'barrio-blend-medium-roast',
    status: ProductStatus.PUBLISHED,
    category_ids: categories
      .filter(({ name }) => name === 'Blends')
      .map(({ id }) => id),
    tag_ids: tags
      .filter(t => ['Best Seller', 'Latin America', 'Africa'].includes(t.value))
      .map(t => t.id),
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/barrio-blend.png',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'BARRIO-BLEND',
      prices: {
        usd: 18_00,
        cad: 24_00,
      },
    }),
  },
  {
    title: 'Midnight Dark - Dark Roast',
    description: 'Our signature blend, dark roasted with a hint of sweetness.',
    handle: 'midnight-dark-roast',
    status: ProductStatus.PUBLISHED,
    category_ids: categories
      .filter(({ name }) => name === 'Blends')
      .map(({ id }) => id),
    tag_ids: tags.filter(t => ['Brazil'].includes(t.value)).map(t => t.id),
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/midnight-dark-roast.png',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'MIDNIGHT-DARK',
      prices: {
        usd: 20_00,
        cad: 27_00,
      },
    }),
  },
  {
    title: 'Sunrise Single-Origin - Light Roast',
    description: 'Our signature blend, light roasted with a hint of sweetness.',
    handle: 'sunrise-single-origin-light-roast',
    status: ProductStatus.PUBLISHED,
    category_ids: categories
      .filter(({ name }) => name === 'Single Origin')
      .map(({ id }) => id),
    tag_ids: tags
      .filter(t => ['Best Seller', 'Ethiopia'].includes(t.value))
      .map(t => t.id),
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/sunrise-single.png',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'SUNRISE-SINGLE',
      prices: {
        usd: 22_00,
        cad: 29_00,
      },
    }),
  },
  {
    title: 'Barrio Decaf - Medium Roast',
    description:
      'Our signature blend, medium-dark roasted with a hint of sweetness.',
    handle: 'barrio-decaf-medium-roast',
    category_ids: categories
      .filter(({ name }) => name === 'Blends')
      .map(({ id }) => id),
    status: ProductStatus.PUBLISHED,
    tag_ids: tags.filter(t => ['Columbia'].includes(t.value)).map(t => t.id),
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/barrio-decaf.png',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'BARRIO-DECAF',
      prices: {
        usd: 20_00,
        cad: 27_00,
      },
    }),
  },
];

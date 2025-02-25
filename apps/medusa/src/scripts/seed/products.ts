import { CreateProductWorkflowInputDTO, ProductCollectionDTO, ProductTagDTO } from '@medusajs/framework/types';
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
  collections,
  tags,
  sales_channels,
  categories,
  shipping_profile_id,
}: {
  collections: ProductCollectionDTO[];
  tags: ProductTagDTO[];
  categories: { id: string; name: string }[];
  sales_channels: { id: string }[];
  shipping_profile_id: string;
}): CreateProductWorkflowInputDTO[] => [
  {
    title: 'Barrio Blend - Medium Roast',
    description:
      'Dive into the rich tapestry of flavors with our Barrio Blend, a masterful medium-dark roast that harmonizes a symphony of taste. Each sip reveals layers of complexity, with a gentle sweetness that dances on the palate, making it an exquisite choice for those who cherish a well-rounded coffee experience.',
    handle: 'barrio-blend-medium-roast',
    status: ProductStatus.PUBLISHED,
    category_ids: categories.filter(({ name }) => name === 'Blends').map(({ id }) => id),
    tag_ids: tags.filter((t) => ['Best Seller', 'Latin America', 'Africa'].includes(t.value)).map((t) => t.id),
    thumbnail: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Barrio-Blend.jpg',
    collection_id: collections.find(({ title }) => title === 'Medium Roasts')?.id,
    shipping_profile_id,
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Barrio-Blend.jpg',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'BARRIO-BLEND',
      prices: {
        usd: 18.0,
        cad: 24.0,
      },
    }),
  },
  {
    title: 'Midnight Dark - Dark Roast',
    description:
      'Awaken your senses with the Midnight Dark blend, a bold and luxurious dark roast that captivates with its deep, intense flavors. This coffee is a testament to meticulous roasting, offering a velvety texture and a lingering sweetness that envelops the palate, perfect for those who savor a robust and full-bodied cup.',
    handle: 'midnight-dark-roast',
    status: ProductStatus.PUBLISHED,
    collection_id: collections.find(({ title }) => title === 'Dark Roasts')?.id,
    category_ids: categories.filter(({ name }) => name === 'Blends').map(({ id }) => id),
    tag_ids: tags.filter((t) => ['Brazil'].includes(t.value)).map((t) => t.id),
    thumbnail: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Midnight-Dark-Roast.jpg',
    shipping_profile_id,
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Midnight-Dark-Roast.jpg',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'MIDNIGHT-DARK',
      prices: {
        usd: 20.0,
        cad: 27.0,
      },
    }),
  },
  {
    title: 'Sunrise Single-Origin - Light Roast',
    description:
      'Embrace the dawn with our Sunrise Single-Origin, a light roast that celebrates the unique terroir of its beans. This coffee is a vibrant expression of bright, floral notes and a subtle sweetness, offering a refreshing and invigorating experience that is ideal for starting your day or enjoying a serene afternoon.',
    handle: 'sunrise-single-origin-light-roast',
    status: ProductStatus.PUBLISHED,
    collection_id: collections.find(({ title }) => title === 'Light Roasts')?.id,
    category_ids: categories.filter(({ name }) => name === 'Single Origin').map(({ id }) => id),
    tag_ids: tags.filter((t) => ['Best Seller', 'Ethiopia'].includes(t.value)).map((t) => t.id),
    thumbnail: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Sunrise-Single.jpg',
    shipping_profile_id,
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Sunrise-Single.jpg',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'SUNRISE-SINGLE',
      prices: {
        usd: 22.0,
        cad: 29.0,
      },
    }),
  },
  {
    title: 'Barrio Decaf - Medium Roast',
    description:
      'Uncover the smooth elegance of our Barrio Decaf, a medium roast crafted for those who desire the rich essence of coffee without the caffeine. This blend is a delicate balance of flavors, with a hint of sweetness that provides a satisfying and delightful experience, any time of the day or night.',
    handle: 'barrio-decaf-medium-roast',
    collection_id: collections.find(({ title }) => title === 'Medium Roasts')?.id,
    category_ids: categories.filter(({ name }) => name === 'Blends').map(({ id }) => id),
    status: ProductStatus.PUBLISHED,
    tag_ids: tags.filter((t) => ['Colombia'].includes(t.value)).map((t) => t.id),
    thumbnail: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Barrio-Decaf.jpg',
    shipping_profile_id,
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Barrio-Decaf.jpg',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'BARRIO-DECAF',
      prices: {
        usd: 20.0,
        cad: 27.0,
      },
    }),
  },
  {
    title: 'Coconut Mocha Delight - Medium Roast',
    description:
      'Escape to a tropical paradise with our Coconut Mocha Delight, a medium roast that marries the rich, robust flavors of coffee with the exotic allure of coconut and a whisper of chocolate. This enchanting blend is a journey of taste, perfect for those seeking a unique and indulgent coffee experience.',
    handle: 'coconut-mocha-delight-medium-roast',
    collection_id: collections.find(({ title }) => title === 'Medium Roasts')?.id,
    category_ids: categories.filter(({ name }) => name === 'Blends').map(({ id }) => id),
    status: ProductStatus.PUBLISHED,
    tag_ids: tags.filter((t) => ['Colombia'].includes(t.value)).map((t) => t.id),
    thumbnail: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Coconut-Mocha.jpg',
    shipping_profile_id,
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Coconut-Mocha.jpg',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'COCONUT-MOCHA',
      prices: {
        usd: 22.0,
        cad: 29.0,
      },
    }),
  },

  {
    title: 'Chili Choco Spice - Dark Roast',
    description:
      'Embark on a daring flavor journey with our Chili Choco Spice, a dark roast that boldly combines the fiery warmth of chili with the decadent richness of chocolate. This adventurous blend is a thrilling experience for the palate, offering a spicy-sweet symphony that is both exciting and deeply satisfying.',
    handle: 'chili-choco-spice-dark-roast',
    collection_id: collections.find(({ title }) => title === 'Dark Roasts')?.id,
    category_ids: categories.filter(({ name }) => name === 'Blends').map(({ id }) => id),
    status: ProductStatus.PUBLISHED,
    tag_ids: tags.filter((t) => ['Guatemala'].includes(t.value)).map((t) => t.id),
    thumbnail: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Chili-Choco.jpg',
    shipping_profile_id,
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Chili-Choco.jpg',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'CHILI-CHOCO',
      prices: {
        usd: 24.0,
        cad: 31.0,
      },
    }),
  },

  {
    title: 'Cardamom Spiced Roast - Dark Roast',
    description:
      'Transport yourself to distant lands with our Cardamom Spiced Roast, a dark blend infused with the exotic and aromatic essence of cardamom. This luxurious coffee offers a rich and captivating taste experience, enveloping you in a world of flavor that is both intriguing and comforting.',
    handle: 'cardamom-spiced-roast-dark-blend',
    collection_id: collections.find(({ title }) => title === 'Dark Roasts')?.id,
    category_ids: categories.filter(({ name }) => name === 'Blends').map(({ id }) => id),
    status: ProductStatus.PUBLISHED,
    tag_ids: tags.filter((t) => ['Yemen'].includes(t.value)).map((t) => t.id),
    thumbnail: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Cardamom-Spice.jpg',
    shipping_profile_id,
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Cardamom-Spice.jpg',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'CARDAMOM-SPICE',
      prices: {
        usd: 25.0,
        cad: 32.0,
      },
    }),
  },

  {
    title: 'Twilight Peak - Dark Roast',
    description:
      'Discover the majestic flavors of our Twilight Peak, a dark roast sourced from the pristine highlands of Peru. This coffee is a celebration of bold, smooth flavors with a refined finish, offering a rich and satisfying experience that is perfect for those who appreciate a well-crafted cup.',
    handle: 'twilight-peak-dark-roast',
    collection_id: collections.find(({ title }) => title === 'Dark Roasts')?.id,
    category_ids: categories.filter(({ name }) => name === 'Blends').map(({ id }) => id),
    status: ProductStatus.PUBLISHED,
    tag_ids: tags.filter((t) => ['Peru'].includes(t.value)).map((t) => t.id),
    thumbnail: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Twilight-Peak.jpg',
    shipping_profile_id,
    images: [
      {
        url: 'https://lambdacurrysites.s3.us-east-1.amazonaws.com/barrio/Twilight-Peak.jpg',
      },
    ],
    ...buildBaseProductData({
      sales_channels,
      sku: 'TWILIGHT-PEAK',
      prices: {
        usd: 26.0,
        cad: 33.0,
      },
    }),
  },
];

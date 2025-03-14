import { CreateProductWorkflowInputDTO } from '@medusajs/framework/types';
import { ProductStatus } from '@medusajs/utils';

interface SeedProductsArgs {
  collections: { id: string; title: string }[];
  tags: { id: string; value: string }[];
  categories: { id: string; name: string }[];
  sales_channels: { id: string }[];
  shipping_profile_id: string;
}

interface TrainingProductOptions {
  shipping_profile_id: string;
  sales_channels: { id: string }[];
  category_id?: string;
  tag_ids: string[];
  title: string;
  subtitle: string;
  description: string;
  handle: string;
  thumbnail: string;
  durations: string[];
  levels: string[];
  prices: {
    [key: string]: {
      usd: number;
      cad: number;
    };
  };
}

export const buildBaseTrainingProductData = ({
  shipping_profile_id,
  sales_channels,
  category_id,
  tag_ids,
  title,
  subtitle,
  description,
  handle,
  thumbnail,
  durations,
  levels,
  prices,
}: TrainingProductOptions): CreateProductWorkflowInputDTO => {
  // Create options for durations and levels
  const options = [
    {
      title: 'Duration',
      values: durations,
    },
  ];

  if (levels.length > 0) {
    options.push({
      title: 'Level',
      values: levels,
    });
  }

  // Create variants based on combinations of durations and levels
  const variants = [];

  for (const duration of durations) {
    for (const level of levels) {
      const variantKey = `${duration} / ${level}`;
      const priceInfo = prices[variantKey];

      if (priceInfo) {
        variants.push({
          title: variantKey,
          prices: [
            {
              currency_code: 'usd',
              amount: priceInfo.usd,
            },
            {
              currency_code: 'cad',
              amount: priceInfo.cad,
            },
          ],
          options: {
            Duration: duration,
            Level: level,
          },
        });
      }
    }
  }

  return {
    title,
    subtitle,
    description,
    handle,
    status: 'published' as ProductStatus,
    thumbnail,
    options,
    variants,
    category_ids: category_id ? [category_id] : [],
    tag_ids: tag_ids.filter(Boolean) as string[],
    sales_channels,
    shipping_profile_id,
  };
};

export const seedProducts = ({
  collections,
  tags,
  categories,
  sales_channels,
  shipping_profile_id,
}: SeedProductsArgs): CreateProductWorkflowInputDTO[] => {
  const businessCategory = categories.find((c) => c.name === 'Business')?.id;
  const technicalCategory = categories.find((c) => c.name === 'Technical Skills')?.id;
  const leadershipCategory = categories.find((c) => c.name === 'Leadership')?.id;

  const beginnerTag = tags.find((t) => t.value === 'Beginner')?.id;
  const intermediateTag = tags.find((t) => t.value === 'Intermediate')?.id;
  const advancedTag = tags.find((t) => t.value === 'Advanced')?.id;
  const featuredTag = tags.find((t) => t.value === 'Featured')?.id;
  const popularTag = tags.find((t) => t.value === 'Popular')?.id;
  const newTag = tags.find((t) => t.value === 'New')?.id;

  return [
    buildBaseTrainingProductData({
      title: 'Introduction to 360 Training',
      subtitle: 'Get started with your learning journey',
      description: 'A comprehensive introduction to our training platform and learning methodology.',
      handle: 'introduction-to-360-training',
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60',
      durations: ['4 hours', '8 hours', '16 hours'],
      levels: ['Beginner', 'Intermediate', 'Advanced'],
      prices: {
        '4 hours / Beginner': { usd: 49, cad: 49 },
        '8 hours / Intermediate': { usd: 99, cad: 99 },
        '16 hours / Advanced': { usd: 199, cad: 199 },
      },
      category_id: businessCategory,
      tag_ids: [beginnerTag, featuredTag, newTag].filter(Boolean) as string[],
      sales_channels,
      shipping_profile_id,
    }),
    buildBaseTrainingProductData({
      title: 'Modern Web Development',
      subtitle: 'Master the latest web technologies',
      description: 'Learn modern web development practices, frameworks, and tools.',
      handle: 'modern-web-development',
      thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=60',
      durations: ['8 hours', '16 hours', '24 hours'],
      levels: ['Intermediate', 'Advanced'],
      prices: {
        '8 hours / Intermediate': { usd: 149, cad: 149 },
        '16 hours / Advanced': { usd: 299, cad: 299 },
        '24 hours / Advanced': { usd: 449, cad: 449 },
      },
      category_id: technicalCategory,
      tag_ids: [intermediateTag, advancedTag, popularTag].filter(Boolean) as string[],
      sales_channels,
      shipping_profile_id,
    }),
    buildBaseTrainingProductData({
      title: 'Advanced Leadership Strategies',
      subtitle: 'Lead with confidence and impact',
      description: 'Develop advanced leadership skills and strategies for managing teams effectively.',
      handle: 'advanced-leadership-strategies',
      thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60',
      durations: ['16 hours', '24 hours', '32 hours'],
      levels: ['Advanced'],
      prices: {
        '16 hours / Advanced': { usd: 399, cad: 399 },
        '24 hours / Advanced': { usd: 599, cad: 599 },
        '32 hours / Advanced': { usd: 799, cad: 799 },
      },
      category_id: leadershipCategory,
      tag_ids: [advancedTag, featuredTag].filter(Boolean) as string[],
      sales_channels,
      shipping_profile_id,
    }),
  ];
};

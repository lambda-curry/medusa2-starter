import {
  createApiKeysWorkflow,
  createOrderWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createProductTagsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from '@medusajs/core-flows';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import type { Logger, MedusaContainer } from '@medusajs/types';
import type {
  ExecArgs,
  IFulfillmentModuleService,
  ISalesChannelModuleService,
  IStoreModuleService,
} from '@medusajs/types';
import { seedProducts } from './seed/products';
import type { IPaymentModuleService } from '@medusajs/framework/types';
import { createCollectionsWorkflow } from '@medusajs/medusa/core-flows';
import { Link } from '@medusajs/modules-sdk';
import { createProductReviewsWorkflow } from '@lambdacurry/medusa-product-reviews/workflows/create-product-reviews';
import { createProductReviewResponsesWorkflow } from '@lambdacurry/medusa-product-reviews/workflows/create-product-review-responses';
import { generateReviewResponse, reviewContents, texasCustomers } from './seed/reviews';
import * as fs from 'fs';
import * as path from 'path';
import { type ApiKeyTypeEnum } from '../../.medusa/types/query-entry-points';

export default async function seedDemoData({ container }: { container: MedusaContainer }) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve<Link>(ContainerRegistrationKeys.LINK);
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService: IStoreModuleService = container.resolve(Modules.STORE);

  const paymentModuleService: IPaymentModuleService = container.resolve(Modules.PAYMENT);

  const canadianCountries = ['ca'];
  const americanCountries = ['us'];
  const allCountries = [...canadianCountries, ...americanCountries];

  logger.info('Seeding store data...');

  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: 'Default Sales Channel',
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(container).run({
      input: {
        salesChannelsData: [
          {
            name: 'Default Sales Channel',
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: 'usd',
            is_default: true,
          },
          {
            currency_code: 'cad',
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info('Seeding region data...');

  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: 'United States',
          currency_code: 'usd',
          countries: americanCountries,
          payment_providers: ['pp_stripe_stripe'],
        },
        {
          name: 'Canada',
          currency_code: 'cad',
          countries: canadianCountries,
          payment_providers: ['pp_stripe_stripe'],
        },
      ],
    },
  });
  const usRegion = regionResult[0];
  const caRegion = regionResult[1];
  logger.info('Finished seeding regions.');

  logger.info('Seeding tax regions...');

  await createTaxRegionsWorkflow(container).run({
    input: allCountries.map((country_code) => ({
      country_code,
    })),
  });

  logger.info('Finished seeding tax regions.');

  logger.info('Seeding stock location data...');
  const { result: stockLocationResult } = await createStockLocationsWorkflow(container).run({
    input: {
      locations: [
        {
          name: 'US Warehouse',
          address: {
            address_1: '123 Main St',
            address_2: '',
            city: 'New York',
            country_code: 'US',
            postal_code: '10001',
            province: 'NY',
          },
        },
      ],
    },
  });
  const americanStockLocation = stockLocationResult[0];

  // Link the stock location to the fulfillment provider using Link directly
  await link.create([
    {
      [Modules.STOCK_LOCATION]: {
        stock_location_id: americanStockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: 'manual_manual',
      },
    },
  ]);

  logger.info('Seeding fulfillment data...');
  const { result: shippingProfileResult } = await createShippingProfilesWorkflow(container).run({
    input: {
      data: [
        {
          name: 'Default',
          type: 'default',
        },
      ],
    },
  });

  const shippingProfile = shippingProfileResult[0];

  const northAmericanFulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: 'North American delivery',
    type: 'shipping',
    service_zones: [
      {
        name: 'United States',
        geo_zones: [
          {
            country_code: 'us',
            type: 'country',
          },
        ],
      },
      {
        name: 'Canada',
        geo_zones: [
          {
            country_code: 'ca',
            type: 'country',
          },
        ],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: americanStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: northAmericanFulfillmentSet.id,
    },
  });

  const { result: collectionsResult } = await createCollectionsWorkflow(container).run({
    input: {
      collections: [
        {
          title: 'Light Roasts',
          handle: 'light-roasts',
        },
        {
          title: 'Medium Roasts',
          handle: 'medium-roasts',
        },
        {
          title: 'Dark Roasts',
          handle: 'dark-roasts',
        },
      ],
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: 'Standard Shipping',
        price_type: 'flat',
        provider_id: 'manual_manual',
        service_zone_id: northAmericanFulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: 'Standard',
          description: 'Ship in 2-3 days.',
          code: 'standard',
        },
        prices: [
          {
            currency_code: 'usd',
            amount: 5,
          },
          {
            currency_code: 'cad',
            amount: 5,
          },
          {
            region_id: usRegion.id,
            amount: 5,
          },
          {
            region_id: caRegion.id,
            amount: 5,
          },
        ],
        rules: [
          {
            attribute: 'enabled_in_store',
            value: 'true',
            operator: 'eq',
          },
          {
            attribute: 'is_return',
            value: 'false',
            operator: 'eq',
          },
        ],
      },
      {
        name: 'Express Shipping',
        price_type: 'flat',
        provider_id: 'manual_manual',
        service_zone_id: northAmericanFulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: 'Express',
          description: 'Ship in 24 hours.',
          code: 'express',
        },
        prices: [
          {
            currency_code: 'usd',
            amount: 10,
          },
          {
            currency_code: 'cad',
            amount: 10,
          },
          {
            region_id: usRegion.id,
            amount: 10,
          },
          {
            region_id: caRegion.id,
            amount: 10,
          },
        ],
        rules: [
          {
            attribute: 'enabled_in_store',
            value: 'true',
            operator: 'eq',
          },
          {
            attribute: 'is_return',
            value: 'false',
            operator: 'eq',
          },
        ],
      },
    ],
  });

  logger.info('Finished seeding fulfillment data.');

  // Link sales channel to stock location
  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: americanStockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  logger.info('Finished seeding stock location data.');

  logger.info('Seeding publishable API key data...');
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: 'Storefront',
          type: 'publishable',
          created_by: '',
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });

  logger.info('Seeding product data...');

  const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
    input: {
      product_categories: [
        {
          name: 'Business',
          is_active: true,
        },
        {
          name: 'Technical Skills',
          is_active: true,
        },
        {
          name: 'Leadership',
          is_active: true,
        },
      ],
    },
  });

  const { result: productTagsResult } = await createProductTagsWorkflow(container).run({
    input: {
      product_tags: [
        {
          value: 'Beginner',
        },
        {
          value: 'Intermediate',
        },
        {
          value: 'Advanced',
        },
        {
          value: 'Featured',
        },
        {
          value: 'Popular',
        },
        {
          value: 'New',
        },
      ],
    },
  });

  const { result: productResult } = await createProductsWorkflow(container).run({
    input: {
      products: seedProducts({
        collections: collectionsResult,
        tags: productTagsResult,
        categories: categoryResult,
        sales_channels: [{ id: defaultSalesChannel[0].id }],
        shipping_profile_id: shippingProfile.id,
      }),
    },
  });

  for (const product of productResult) {
    const firstVariant = product.variants[0];

    // Determine a random number of reviews between 5 and 10 for this product
    const numReviews = Math.floor(Math.random() * 6) + 5; // Random number between 5 and 10

    // Shuffle the customers array to get random customers for each product
    const shuffledCustomers = [...texasCustomers].sort(() => 0.5 - Math.random());
    const selectedCustomers = shuffledCustomers.slice(0, numReviews);

    // Shuffle the review contents to get random reviews
    const shuffledReviews = [...reviewContents].sort(() => 0.5 - Math.random());
    const selectedReviews = shuffledReviews.slice(0, numReviews);

    // Create multiple orders for each product with different customers
    const orders = [];
    for (const customer of selectedCustomers) {
      try {
        const { result: order } = await createOrderWorkflow(container).run({
          input: {
            email: customer.email,
            shipping_address: {
              first_name: customer.first_name,
              last_name: customer.last_name,
              phone: customer.phone,
              city: customer.city,
              country_code: 'US',
              province: 'TX',
              address_1: customer.address_1,
              postal_code: customer.postal_code,
            },
            items: [
              {
                variant_id: firstVariant.id,
                product_id: product.id,
                quantity: 1,
                title: product.title,
                thumbnail: product.thumbnail ?? undefined,
                unit_price: 18.0,
              },
            ],
            transactions: [
              {
                amount: 18.0,
                currency_code: 'usd',
              },
            ],
            region_id: usRegion.id,
            sales_channel_id: defaultSalesChannel[0].id,
          },
        });

        orders.push(order);
      } catch (error: any) {
        logger.error(`Error creating order: ${error.message}`);
        // Continue with next customer
        continue;
      }
    }

    // Only proceed with reviews if we have orders
    if (orders.length === 0) {
      logger.info(`Skipping reviews for product ${product.title} as no orders were created`);
      continue;
    }

    // Create product reviews for each order
    const productReviews = [];
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const customer = selectedCustomers[i];
      const review = selectedReviews[i];

      productReviews.push({
        product_id: product.id,
        order_id: order.id,
        order_line_item_id: order.items?.[0]?.id,
        rating: review.rating,
        content: review.content,
        first_name: customer.first_name,
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        images: review.images,
      });
    }

    const { result: productReviewsResult } = await createProductReviewsWorkflow(container).run({
      input: {
        productReviews: productReviews,
      },
    });

    await createProductReviewResponsesWorkflow(container).run({
      input: {
        responses: productReviewsResult.map((review) => ({
          product_review_id: review.id,
          content: generateReviewResponse(review),
        })),
      },
    });
  }

  logger.info('Finished seeding product data.');
  logger.info(`PUBLISHABLE API KEY: ${publishableApiKey.token}`);

  // Check if we're in a local environment (not production)
  const isLocalEnvironment = process.env.NODE_ENV !== 'production';

  if (isLocalEnvironment) {
    // Path to the storefront .env file
    const envFilePath = path.resolve(__dirname, '../../../../apps/storefront/.env');

    // Check if the file exists
    if (fs.existsSync(envFilePath)) {
      // Read the current .env file
      let envContent = fs.readFileSync(envFilePath, 'utf8');

      // Replace the MEDUSA_PUBLISHABLE_KEY line or add it if it doesn't exist
      const keyRegex = /^MEDUSA_PUBLISHABLE_KEY=.*$/m;
      const newKeyLine = `MEDUSA_PUBLISHABLE_KEY='${publishableApiKey.token}'`;

      if (keyRegex.test(envContent)) {
        // Replace existing key
        envContent = envContent.replace(keyRegex, newKeyLine);
      } else {
        // Add key if it doesn't exist
        envContent += `\n${newKeyLine}`;
      }

      // Write the updated content back to the file
      fs.writeFileSync(envFilePath, envContent);
      logger.info(`Updated storefront .env file with publishable key: ${publishableApiKey.token}`);
    } else {
      logger.warn(`Storefront .env file not found at ${envFilePath}`);
    }
  }
}

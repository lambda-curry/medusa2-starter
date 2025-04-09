import type { McpTool } from '../../types';
import { handleToolError } from '../../helpers';
import { upsertStockLocationAddressesSchema } from '../stock-location-tools.schemas';
import { Modules } from '@medusajs/framework/utils';

// Define an interface for the address input
interface UpsertStockLocationAddressInput {
  id?: string;
  address_1: string;
  address_2?: string;
  city: string;
  country_code: string;
  postal_code: string;
  province?: string;
  phone?: string;
}

// Define an interface for the address response
interface StockLocationAddress {
  id: string;
  address_1: string;
  address_2?: string | null;
  city: string;
  country_code: string;
  postal_code: string;
  province?: string | null;
  phone?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// Define the response interface that includes location_id
interface StockLocationAddressResponse extends StockLocationAddress {
  location_id: string;
}

export const upsertStockLocationAddressesTool: McpTool<typeof upsertStockLocationAddressesSchema> = {
  name: 'upsert-stock-location-addresses',
  description: 'Add or update addresses for stock locations',
  schema: upsertStockLocationAddressesSchema,
  execute: async (args, { req, logger }) => {
    try {
      if (!req) {
        throw new Error('Request context not set');
      }

      logger.info(`Upserting ${args.addresses.length} stock location addresses`);

      // Get the stock location service from the container
      const stockLocationService = req.scope.resolve(Modules.STOCK_LOCATION);

      if (!stockLocationService) {
        throw new Error('Stock location service not found');
      }

      // First, get all the stock locations to check for existing addresses
      const locationIds = args.addresses.map((item) => item.location_id);
      const stockLocations = await stockLocationService.listStockLocations(
        { id: locationIds },
        { relations: ['address'] },
      );

      // Create a map of location ID to existing address ID
      const locationToAddressMap: Record<string, string> = {};
      stockLocations.forEach((location) => {
        if (location.address && location.address.id) {
          locationToAddressMap[location.id] = location.address.id;
        }
      });

      // Process each address
      const results: StockLocationAddressResponse[] = [];

      // Prepare all address inputs for batch processing
      const addressInputs: UpsertStockLocationAddressInput[] = args.addresses.map((item) => {
        const locationId = item.location_id;
        const existingAddressId = locationToAddressMap[locationId];

        return {
          // Include ID only if updating an existing address
          ...(existingAddressId && { id: existingAddressId }),
          address_1: item.address.address_1,
          address_2: item.address.address_2 || undefined,
          city: item.address.city,
          country_code: item.address.country_code,
          postal_code: item.address.postal_code,
          province: item.address.province || undefined,
          phone: item.address.phone || undefined,
        };
      });

      // Step 1: Create or update all addresses in a batch
      logger.debug(`Upserting ${addressInputs.length} addresses`);
      const addressResults = await stockLocationService.upsertStockLocationAddresses(addressInputs);

      // Step 2: Link each address to its stock location
      for (let i = 0; i < addressResults.length; i++) {
        const addressResult = addressResults[i];
        const locationId = args.addresses[i].location_id;
        const originalAddress = args.addresses[i].address;

        // Ensure the address has an ID before proceeding
        if (!addressResult.id) {
          logger.error(`Address result at index ${i} is missing an ID`);
          continue;
        }

        logger.debug(`Linking address ${addressResult.id} to stock location ${locationId}`);
        await stockLocationService.updateStockLocations({ id: locationId }, { address_id: addressResult.id });

        // Add to results with proper type handling and fallbacks for required fields
        results.push({
          id: addressResult.id,
          location_id: locationId,
          address_1: addressResult.address_1 || originalAddress.address_1, // Fallback to input if missing
          address_2: addressResult.address_2 || null,
          city: addressResult.city || originalAddress.city, // Fallback to input if missing
          country_code: addressResult.country_code || originalAddress.country_code, // Fallback to input if missing
          postal_code: addressResult.postal_code || originalAddress.postal_code, // Fallback to input if missing
          province: addressResult.province || null,
          phone: addressResult.phone || null,
          created_at: addressResult.created_at instanceof Date ? addressResult.created_at : new Date(),
          updated_at: addressResult.updated_at instanceof Date ? addressResult.updated_at : new Date(),
        });
      }

      // Format the response
      const responseData = {
        addresses: results,
        message: `Successfully upserted ${results.length} stock location addresses`,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(responseData, null, 2),
          },
        ],
      };
    } catch (error) {
      return handleToolError(error, args, logger);
    }
  },
};

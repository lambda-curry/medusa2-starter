import { sdk } from '@libs/util/server/client.server';
import { medusaError } from '@libs/util/medusaError';
import { HttpTypes, StoreRegionCountry } from '@medusajs/types';
import { getSelectedRegionId } from '../cookies.server';

export const getCountryCode = (country: StoreRegionCountry) => {
  return country?.iso_2 as string;
};

export const listRegions = async function () {
  return sdk.store.region
    .list({})
    .then(({ regions }) => regions)
    .catch(medusaError);
};

export const retrieveRegion = async function (id: string) {
  return sdk.store.region
    .retrieve(id, {})
    .then(({ region }) => region)
    .catch(medusaError);
};

export const getDefaultRegion = async function () {
  const regions = await listRegions().catch((err) => {
    console.error(err);
    return [];
  });
  return regions.sort((r) => (r.countries?.some((c) => c.iso_2 === 'us') ? -1 : 1))[0];
};

export const getSelectedRegion = async (headers: Headers) => {
  const regionId = await getSelectedRegionId(headers);

  if (!regionId) {
    try {
      return await retrieveRegion(regionId);
    } catch (e) {
      console.warn('RegionId is not valid, using default region');
    }
  }

  return await getDefaultRegion();
};

import { sdk } from "@libs/util/server/client.server"
import { medusaError } from "@libs/util/medusa/medusa-error"
import { HttpTypes, StoreRegionCountry } from "@medusajs/types"

export const getCountryCode = (country: StoreRegionCountry) => {
  return country?.iso_2 as string
}

// TODO: Check if CACHING is needed here

export const listRegions = async function () {
  return sdk.store.region
    .list({})
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async function (id: string) {
  return sdk.store.region
    .retrieve(id, {})
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getDefaultRegion = async function () {
  const regions = await listRegions()
  return regions[0]
}

export const getRegion = async function (countryCode: string = "") {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()
    console.log("🚀 ~ getRegion ~ regions:", regions)

    if (!regions) {
      return null
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(getCountryCode(c) ?? "", region)
      })
    })

    const region = countryCode ? regionMap.get(countryCode) : getDefaultRegion()

    return region
  } catch (e: any) {
    return null
  }
}

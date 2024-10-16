export const buildSearchParamsFromObject = (search: Record<string, any>, prefix = '', isArray = false): string => {
  return Object.entries(search)
    .filter(([key, value]) => value)
    .map(([key, value]) =>
      typeof value === 'object'
        ? buildSearchParamsFromObject(value, key, Array.isArray(value))
        : `${prefix ? `${prefix}[${isArray ? '' : key}]` : `${key}`}=${value}`,
    )
    .join('&');
};

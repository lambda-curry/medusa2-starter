export const buildObjectFromSearchParams = <T>(searchParams: URLSearchParams): T => {
  let params: Record<string, any> = {};

  searchParams.forEach((value, key) => {
    let decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);

    if (decodedKey.endsWith('[]')) {
      // This key is part of an array
      decodedKey = decodedKey.replace('[]', '');
      params[decodedKey] || (params[decodedKey] = []);
      params[decodedKey].push(decodedValue);
    } else {
      // Just a regular parameter
      params[decodedKey] = decodedValue;
    }
  });

  return params as T;
};

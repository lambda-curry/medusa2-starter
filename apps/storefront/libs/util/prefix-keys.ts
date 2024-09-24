export const prefixKeys = (obj: Record<string, any>, prefix: string) =>
  Object.entries(obj).reduce((acc, [key, value]) => ({ ...acc, [`${prefix}${key}`]: value }), {});

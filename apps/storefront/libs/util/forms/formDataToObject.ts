import set from 'lodash/set';

export const formDataToObject: <T>(formData: FormData) => Record<string, T | T[]> = <T>(formData: FormData) =>
  Array.from(formData.entries()).reduce(
    (acc, [key, value]) => {
      if (acc.hasOwnProperty(key)) {
        if (Array.isArray(acc[key])) {
          (acc[key] as T[]).push(value as T);
        } else {
          acc[key] = [acc[key], value] as T[];
        }
      } else {
        set(acc, key, value);
      }
      return acc;
    },
    {} as Record<string, T | T[]>,
  );

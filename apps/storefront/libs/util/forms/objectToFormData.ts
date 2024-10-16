/**
 * Converts javascript arrays and objects to FormData
 * @param data
 * @param formData
 * @param parentKey
 * @returns
 */
export const convertToFormData = (data: any, formData: FormData = new FormData(), parentKey = ''): FormData => {
  if (data === null || data === undefined) return formData;

  if (typeof data === 'object' && !(data instanceof Date) && !(data instanceof File)) {
    Object.entries(data).forEach(([key, value]) => {
      convertToFormData(
        value,
        formData,
        !parentKey ? key : data[key] instanceof File ? parentKey : `${parentKey}[${key}]`,
      );
    });
    return formData;
  }

  if (Array.isArray(data)) {
    data.forEach((value, index) => {
      convertToFormData(value, formData, `${parentKey}[${index}]`);
    });
    return formData;
  }

  formData.append(parentKey, data);

  return formData;
};
